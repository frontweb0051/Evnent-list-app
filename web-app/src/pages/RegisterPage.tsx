import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/api/error";

type RegisterValue = {
  name: string,
  email: string,
  password: string
}

export default function RegisterPage() {
  const [values, setValues] = useState<RegisterValue>({name: "", email: "", password:""});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldsError, setFieldsError] = useState<Record<string, string>>({});
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setValues((prev) => {
      return {...prev, [name]:value}
    });
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setFieldsError({});

    try {
      await register(values.name, values.email, values.password);
      navigate("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
        if (err.code === "VALIDATION_ERROR") {
          setFieldsError(err.fields);
        }
      } else {
        setErrorMessage("新規会員登録に失敗しました。時間をおいてもう一度お試しください")
      }
    } finally {
      setIsSubmitting(false);
    }
  }


  return (
    <section className="auth-page">
      <div className="container">
        <div className="auth-card">
          <header className="auth-card-header">
            <p className="auth-eyebrow">JOIN EVENTHUB</p>
            <h1 className="auth-title">新規会員登録</h1>
            <p className="auth-description">必要事項を入力してアカウントを作成してください。</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="register-name">
                お名前 <span className="req">*</span>
              </label>
              <input
                className="form-input"
                type="text"
                id="register-name"
                name="name"
                placeholder="田中 太郎"
                autoComplete="name"
                value={values.name}
                maxLength={100}
                onChange={handleChange}
                required
              />
              {fieldsError.name && <span className="form-errmsg show" id="login-name-error" role="alert">{fieldsError.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-email">
                メールアドレス <span className="req">*</span>
              </label>
              <input
                className="form-input"
                type="email"
                id="register-email"
                name="email"
                placeholder="example@example.com"
                autoComplete="email"
                value={values.email}
                maxLength={255}
                onChange={handleChange}
                required
              />
              {fieldsError.email && <span className="form-errmsg show" id="login-email-error" role="alert">{fieldsError.email}</span>} 
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-password">
                パスワード <span className="req">*</span>
              </label>
              <input
                className="form-input"
                type="password"
                id="register-password"
                name="password"
                autoComplete="new-password"
                value={values.password}
                onChange={handleChange}
                required
              />
              <p className="form-hint">安全のため、他のサービスと異なるパスワードを設定してください。</p>
              {fieldsError.password && <span className="form-errmsg show" id="login-password-error" role="alert">{fieldsError.password}</span>}
            </div>

            {errorMessage && <p className="form-errmsg show" role="alert">{errorMessage}</p>}

            <div className="auth-form-footer">
              <button 
                className="btn btn-primary btn-lg btn-full" 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "登録中" : "登録" }
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
