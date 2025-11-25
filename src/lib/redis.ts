import Redis from "ioredis";

// Sempre prefira 127.0.0.1 em desenvolvimento para evitar resolução IPv6/IPv4
const url = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

const redis = new Redis(url, {
    // não conectar automaticamente na inicialização; conectará ao primeiro comando
    lazyConnect: true,
    connectTimeout: 10000,
    // permitir tentativas por request indefinidas
    maxRetriesPerRequest: null,
    // limitar número de tentativas globais antes de parar (ex.: 10 tentativas)
    retryStrategy(times: number) {
        if (times > 10) return null; // parar de tentar após 10 tentativas
        return Math.min(times * 50, 2000);
    },
    // evitar reconectar automaticamente em alguns erros conhecidos
    reconnectOnError(err: any) {
        // se o erro for ECONNREFUSED (host inacessível), não forçar reconexão imediata
        if (err && err.code === "ECONNREFUSED") return false;
        return true;
    },
});

// Throttle de logs para evitar imprimir o mesmo erro repetidamente (ex.: ECONNREFUSED rápido)
const _lastErrorLog: Map<string, number> = new Map();
const LOG_THROTTLE_MS = 60 * 1000; // 1 minuto

redis.on("error", (err: any) => {
    try {
        const code = err && (err.code || (err instanceof Error ? err.name : String(err)));
        const key = String(code ?? "unknown");
        const last = _lastErrorLog.get(key) || 0;
        const now = Date.now();
        if (now - last > LOG_THROTTLE_MS) {
            console.error("[redis] error:", err instanceof Error ? err.message : err, err);
            _lastErrorLog.set(key, now);
        } else {
            // versão curta do log (opcional): apenas debug
            // console.debug("[redis] suppressed error:", err && err.code ? err.code : err);
        }
    } catch (logErr) {
        // garantir que handler não lance
        console.error("[redis] error handler failed", logErr);
    }
});

// também throttle para eventos de connect/close para evitar spam de logs
const _lastEventLog: Map<string, number> = new Map();
function maybeLogEvent(key: string, level: 'log' | 'error' = 'log', ...args: any[]) {
    try {
        const now = Date.now();
        const last = _lastEventLog.get(key) || 0;
        if (now - last > LOG_THROTTLE_MS) {
            _lastEventLog.set(key, now);
            if (level === 'error') console.error(...args); else console.log(...args);
        }
    } catch (e) {
        // ignore
    }
}

redis.on("connect", () => {
    maybeLogEvent('connect', 'log', '[redis] connected');
});

redis.on("close", () => {
    maybeLogEvent('close', 'log', '[redis] connection closed');
});

export default redis;
