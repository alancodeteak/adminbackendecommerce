export function getShop({ shopsRepo }) {
  return async function execute(client, { id }) {
    return await shopsRepo.getById(client, id);
  };
}

