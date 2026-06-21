const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms * 1000))
export { sleep }