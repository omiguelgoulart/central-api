/*
  Warnings:

  - A unique constraint covering the columns `[pagamentoId]` on the table `ingressos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ingressos_pagamentoId_key" ON "ingressos"("pagamentoId");
