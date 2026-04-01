export function listShops({ shopsRepo }) {
  return async function execute(client, params) {
    return await shopsRepo.list(client, params);
  };
}

