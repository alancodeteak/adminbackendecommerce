export function listProducts({ productsRepo }) {
  return async function execute(client, params) {
    return await productsRepo.list(client, params);
  };
}

