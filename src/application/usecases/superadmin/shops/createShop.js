export function createShop({ shopsRepo }) {
  return async function execute(client, params) {
    return await shopsRepo.create(client, params);
  };
}

