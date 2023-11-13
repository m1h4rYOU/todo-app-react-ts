export const useReadTextFile =
  () =>
  (file: File, encoding: string = 'utf8') => {
    const reader = new FileReader();
    reader.readAsText(file, encoding);
    return new Promise<string | ArrayBuffer | null | undefined>((res, rej) => {
      reader.addEventListener('loadend', ({ target }) => res(target?.result));
      reader.addEventListener('error', ({ target }) => rej(target?.error));
    });
  };
