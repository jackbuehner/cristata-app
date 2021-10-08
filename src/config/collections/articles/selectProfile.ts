import { IProfile } from '../../../interfaces/cristata/profiles';
import { db } from '../../../utils/axios/db';

async function selectProfile(inputValue: string) {
  // get all users
  const { data: users }: { data: IProfile[] } = await db.get(`/users`);

  // with the user data, create the options array
  let options: Array<{ value: string; label: string }> = [];
  users.forEach((user) => {
    options.push({
      value: `${user.github_id}`,
      label: user.name,
    });
  });

  // filter the options based on `inputValue`
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  // return the filtered options
  return filteredOptions;
}

export { selectProfile };
