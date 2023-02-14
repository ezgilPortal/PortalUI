export const generateChild = (arr) => {
  const { res } = arr
    .map((item) => {
      return {
        ...item,
        label: item.name,
        data: item.name,
        key: item.id,
      };
    })
    .reduce(
      (acc, curr) => {
        if (acc.parentMap[curr.parentId]) {
          (acc.parentMap[curr.parentId].children = acc.parentMap[curr.parentId].children || []).push(curr);
        } else {
          acc.res.push(curr);
        }
        acc.parentMap[curr.id] = curr;
        return acc;
      },
      { parentMap: {}, res: [] }
    );

  return res;
};
