export const handleDeleteWork = (workToDelete, category, setCategories) => {
  setCategories((prevCategories) => {
    const newCategories = JSON.parse(JSON.stringify(prevCategories));

    const findAndDeleteWork = (categories) => {
      for (let cat of categories) {
        if (cat.code === category.code) {
          cat.works = cat.works.filter(
            (work) => work.code !== workToDelete.code
          );

          cat.works.forEach((work, index) => {
            work.code = `${cat.code}:${index + 1}`;
          });

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