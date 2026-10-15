export type FormValues = {
  name: string;
  email: string;
  guests: string;
  note: string;
  _hp: string;
}

// この書き方と一緒
// export type FormErrors = {
//   name?: string;
//   email?: string;
//   guests?: string;
//   note?: string;
// };
// Partial : すべての項目を任意にする
// Record : key:型のオブジェクトを作成できる
export type FormErrors = Partial<Record<"name" | "email" | "guests" | "note", string>>;


const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validate(values: FormValues, maxGuests: number): FormErrors {
  const errors: FormErrors =  {};
  
  const name = values.name.trim();
  if (name === "") {
    errors.name = "お名前を入力してください";
  } else if (name.length > 100) {
    errors.name = "文字数は100文字以下にしてください";
  }

  const email = values.email.trim();
  if (email === "") {
    errors.email = "メールアドレスを入力してください";
  } else if (email.length > 255 ) {
    errors.email = "メールアドレスは255文字以下で入力してください"

    // 正規表現.test(値) : 文字列が正規表現のパターンと一致するか
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "正しいメールアドレスを入力してください"
  }

  const guests = Number(values.guests);
  if (!Number.isInteger(guests) || guests < 0) {
    errors.guests = "参加人数を選択してください"
  } else if (guests > maxGuests) {
    errors.guests = `参加人数は${maxGuests}人までです`
  }

  if (values.note.length > 1000) {
    errors.note = "備考は1000文字以内にしてください"
  }

  return errors;
}