export const handleDeleteWork = (workToDelete, category, setCategories) => {
  setCategories((prevCategories) => {
    const newCategories = structuredClone(prevCategories);

    const findAndDeleteWork = (categories) => {
      for (const cat of categories) {
        if (cat.code === category.code) {
          cat.works = cat.works.filter(
            (work) => work.code !== workToDelete.code
          );

          let index = 1;
          for (const work of cat.works) {
            work.code = `${cat.code}:${index}`;
            index++;
          }

          return true;
        }

        if (cat.subcategories) {
          if (findAndDeleteWork(cat.subcategories)) {
            return true;
          }
        }
      }
      return false;
    };

    findAndDeleteWork(newCategories);
    return newCategories;
  });
};
