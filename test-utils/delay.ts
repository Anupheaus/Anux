export async function delay(time: number): Promise<void> {
  return new Promise(resolve => window.setTimeout(resolve, time));
}
