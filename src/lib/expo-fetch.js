const customFetch = (...args) => fetch(...args);
export { customFetch as fetch };
export default customFetch;
