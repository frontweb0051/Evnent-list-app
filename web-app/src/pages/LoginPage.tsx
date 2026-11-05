import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth  } from "@/contexts/AuthContext";
import { ApiError } from "@/api/error";

type LoginValue = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [values, setValues] = useState<LoginValue>({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldsError, setFieldsError] = useState<Record<string, string>>({});
  const { login } = useAuth();
  const navigate = useNavigate();


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldsError((prev) => ({ ...prev, [name]: "" }));
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setFieldsError({});

    try {
      await login(values.email, values.password);
      navigate("/mypage");
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
        if (err.code === "VALIDATION_ERROR") {
          setFieldsError(err.fields);
        }
      } else {
        setErrorMessage("ログインに失敗しました。時間をおいて再度お試しください。");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="container">
        <div className="auth-card">
          <header className="auth-card-header">
            <p className="auth-eyebrow">WELCOME BACK</p>
            <h1 className="auth-title">ログイン</h1>
            <p className="auth-description">登録したメールアドレスとパスワードを入力してください。</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">メールアドレス</label>
              <input
                className={`form-input${fieldsError.email ? " is-error" : ""}`}
                type="email"
                name="email"
                id="login-email"
                autoComplete="email"
                value={values.email}
                onChange={handleChange}
                aria-invalid={Boolean(fieldsError.email)}
                aria-describedby={fieldsError.email ? "login-email-error" : undefined}
                required
              />
              {fieldsError.email && <span className="form-errmsg show" id="login-email-error" role="alert">{fieldsError.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">パスワード</label>
              <input
                className={`form-input${fieldsError.password ? " is-error" : ""}`}
                type="password"
                name="password"
                id="login-password"
                autoComplete="current-password"
                value={values.password}
                onChange={handleChange}
                aria-invalid={Boolean(fieldsError.password)}
                aria-describedby={fieldsError.password ? "login-password-error" : undefined}
                required
              />
              {fieldsError.password && <span className="form-errmsg show" id="login-password-error" role="alert">{fieldsError.password}</span>}
            </div>

            {errorMessage && <p className="form-errmsg show" role="alert">{errorMessage}</p>}

            <div className="auth-form-footer">
              <button
                className="btn btn-primary btn-full btn-lg"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "ログイン中..." : "ログイン"}
              </button>
              <p className="auth-footnote">
                アカウントをお持ちでない方は <Link to="/register/" className="auth-register-link">新規会員登録</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
