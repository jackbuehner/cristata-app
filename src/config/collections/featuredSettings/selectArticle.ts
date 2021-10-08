import { db } from '../../../utils/axios/db';

async function selectArticle(inputValue: string) {
  // get all articles
  const { data: articles } = await db.get(`/articles`);

  // with the article data, create the options array
  let options: Array<{ value: string; label: string }> = [];
  articles.forEach((article: { _id: string; name: string; stage: number }) => {
    if (article.stage > 5)
      options.push({
        value: article._id,
        label: `${article.name} (${article._id.slice(-7, article._id.length)})`,
      });
  });

  // filter the options based on `inputValue`
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  // return the filtered options
  return filteredOptions;
}

export { selectArticle };
