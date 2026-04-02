export function listShops({ shopsRepo }) {
  return async function execute(client, params) {
    const limit = params.limit;
    const offset = (params.page - 1) * limit;
    return await shopsRepo.list(client, {
      search: params.search,
      limit,
      offset
    });
  };
}

