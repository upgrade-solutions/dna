import type { OperationalDNA } from '../types/merge'
import type { Process, Trigger } from '../types/operational'

function listProcesses(dna: OperationalDNA): Process[] {
  return (dna.processes ?? []) as Process[]
}

function listTriggers(dna: OperationalDNA): Trigger[] {
  return (dna.triggers ?? []) as Trigger[]
}

export function getProcesses(dna: OperationalDNA): Process[] {
  return listProcesses(dna)
}

export function getProcess(dna: OperationalDNA, name: string): Process | null {
  return listProcesses(dna).find(p => p.name === name) ?? null
}

export function getTriggersForProcess(dna: OperationalDNA, processName: string): Trigger[] {
  return listTriggers(dna).filter(t => t.process === processName)
}
