import { render } from "@testing-library/react";

export const useReadTextFile = ()=>
  (file: File) => {
    const reader = new FileReader();
    reader.readAsText(file, 'utf8');
    return new Promise<string | ArrayBuffer | null | undefined>((res, rej)=>{
      reader.addEventListener('loadend', ({target})=> res(target?.result));
      reader.addEventListener('error', ({target})=> rej(target?.error));
    })
  }