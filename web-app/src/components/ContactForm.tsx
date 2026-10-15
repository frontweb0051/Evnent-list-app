import React, { useState } from "react"
import { applyToEvent, ApiError } from "@/api/event";
import {validate, type FormValues, type FormErrors } from "@/lib/varidate";

type ContactFormProps = {
  contactId: number;
  remaining: number;
}
type Status = "idle" | "submitting" | "sucsess";


export default function ContactForm ({contactId, remaining}:ContactFormProps) {
  const [values, setValues] = useState<FormValues>({
    name: "",
    email: "",
    guests: "",
    note: "",
    _hp: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState("");
  const isFull = remaining <= 0;
  const MAX_GUESTS = 10;


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // () => () と () => {return}は同意
    // setValuesの値を関数を呼び出して取得。今の値の後ろの新しい値を追加する処理を追加
    setValues((prev) => ({...prev, [name]: value}));
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;

    // バリデーションエラーがないか確認
    const found = validate(values, MAX_GUESTS);
    setErrors(found);
    setFormError("");
    if (Object.keys(found).length > 0) return;

    // 送信前にsubmittingに変更
    setStatus("submitting");
    try {
      await applyToEvent(contactId, {
        name: values.name.trim(),
        email: values.email.trim(),
        guests: Number(values.guests),
        note: values.note,
        _hp: values._hp,
      })
      setStatus("sucsess");
    }  catch (err) {
      setStatus("idle");
      if (err instanceof ApiError) {
        console.log("申込失敗:", err.status, err.code, err.message, err.fields);
        setFormError(err.message);
      } else {
        setFormError("通信に失敗しました。時間をおいてもう一度お試したください");
      }
    }
  };

  // 1 〜 min(残り枠, 上限) の選択肢
  const guestOptions:number[] = [];
  // Math.min() : 値を比較して最小の値を返り値とする。
  // MAX_GUESTSを設定しておくことおでremainingで上限を超える値が入力されても、MAX_GUESTSが最小の値として返り値となる
  const max = Math.min(remaining, MAX_GUESTS);
  for(let i = 1; i <= max; i++) {
    guestOptions.push(i);
  }


  // 成功時の画面
  if (status === "sucsess") {
    return (
      <aside>
        <div className="reg-card">
          <div className="reg-success">
            <h3>お申し込みを受け付けました</h3>
            <p>当日お越しをお待ちしております。</p>
          </div>
        </div>
      </aside>
    )
  }

  // イベントの残り人数が0の時
  if (isFull) {
    return (
      <aside>
        <div className="reg-card">
          <div className="reg-head">
            <h2>満員になりました</h2>
            <p>このイベントは定員に達したため、申込を受け付けていません。</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside>
      <div className="reg-card">
        <div className="reg-head">
          <h2>参加を申し込む</h2>
          <p>30秒で完了。メールアドレスだけでOK</p>
        </div>

        <form className="reg-form" onSubmit={handleSubmit} noValidate>

          <div className="form-group">
            <label className="form-label" htmlFor="name">
              お名前 <span className="req">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              placeholder="山田 太郎"
              maxLength={100}
              autoComplete="name"
              onChange={handleChange}
              value={values.name}
              aria-invalid={errors.name ? true : undefined}
              required
            />
            <span className="form-errmsg" id="err-name">お名前を入力してください（100文字以内）</span>
            {/* && : 左がtrueであれば右を出力する */}
            {errors.name && <span className="form-errmsg" id="err-name" role="alert">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              メールアドレス <span className="req">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="taro@example.com"
              maxLength={255}
              autoComplete="email"
              onChange={handleChange}
              value={values.email}
              required
            />
            <span className="form-errmsg" id="err-email">正しいメールアドレスを入力してください</span>
            {errors.email && <span className="form-errmsg" id="err-email" role="alert">{errors.email}</span>}

          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="guests">
              参加人数 <span className="req">*</span>
            </label>
            <select id="guests" name="guests" className="form-select" onChange={handleChange} value={values.guests} required>
              {guestOptions.map((e) => (
                <option key={e} value={String(e)}>
                  {e === 1 ? "1名（本人のみ）" : `${e}名`}
                </option>
              ))}
            </select>
            <span className="form-errmsg" id="err-guests">参加人数を選択してください</span>
            <p className="form-hint">本人を含む合計人数をお選びください</p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="note">備考</label>
            <textarea
              id="note" name="note" className="form-textarea"
              value={values.note} onChange={handleChange}
              maxLength={1000}
            />
          </div>

          <div className="form-honeypot" aria-hidden="true">
            <input
              type="text" name="_hp" tabIndex={-1} autoComplete="off"
              value={values._hp} onChange={handleChange}
            />
          </div>

          <div className="reg-footer">
            <button type="submit" className="btn btn-primary btn-full btn-lg" id="submit-btn">
              申し込む
            </button>
            <p className="privacy-note">
              送信することで<a href="#">プライバシーポリシー</a>に同意したものとみなされます。
            </p>
          </div>

        </form>

        <div className="reg-success" id="reg-success">
          <div className="success-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>お申し込みを受け付けました</h3>
          <p>
            ご登録のメールアドレスに確認メールをお送りします。<br />
            当日お越しをお待ちしております。
          </p>
        </div>

      </div>
    </aside>
  )
}