import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { zhixingCat, zhixingCozyCat, zhixingWinkCat } from "../data/catAssets";

type LoginPageProps = {
  enterApp: (mode: "login" | "guest", displayName?: string) => void;
};

const loginQuotes = [
  {
    text: "知是行之始，行是知之成。",
    author: "王阳明",
  },
  {
    text: "不积跬步，无以至千里。",
    author: "荀子",
  },
  {
    text: "你能掌控的是自己的心，而不是外界事件。",
    author: "马可·奥勒留",
  },
  {
    text: "慢慢来，只要不停止，就已经在靠近。",
    author: "孔子思想改写",
  },
  {
    text: "生活不是等待风暴过去，而是学习在雨中稳住自己。",
    author: "成长箴言",
  },
];

function buildAccountName(account: string) {
  const trimmed = account.trim();
  if (!trimmed) return "体验用户";
  return trimmed.includes("@") ? trimmed.split("@")[0] : trimmed;
}

function buildPhoneName(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 4 ? `手机用户${digits.slice(-4)}` : "手机用户";
}

export function LoginPage({ enterApp }: LoginPageProps) {
  const [loginType, setLoginType] = useState<"account" | "phone">("account");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeNotice, setCodeNotice] = useState("");
  const [error, setError] = useState("");
  const quote = useMemo(
    () => loginQuotes[Math.floor(Math.random() * loginQuotes.length)],
    [],
  );

  function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (loginType === "account") {
      if (!account.trim() || password.length < 4) {
        setError("请输入用户名/邮箱，以及不少于 4 位的密码。");
        return;
      }

      enterApp("login", buildAccountName(account));
      return;
    }

    if (!/^1\d{10}$/.test(phone.trim()) || code.trim().length < 4) {
      setError("请输入 11 位手机号和验证码。");
      return;
    }

    enterApp("login", buildPhoneName(phone));
  }

  function requestCode() {
    if (!/^1\d{10}$/.test(phone.trim())) {
      setError("先输入 11 位手机号，再获取验证码。");
      return;
    }

    setError("");
    setCodeNotice("验证码已模拟发送，演示阶段输入任意 4 位即可。");
  }

  return (
    <main className="login-screen">
      <video
        className="login-bg-video"
        src="/media/login-dynamic-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
      <section className="login-hero" aria-label="知行喵登录体验">
        <div className="login-copy">
          <div className="login-brand-row">
            <span className="login-brand-mark">知行喵</span>
            <span className="login-version">Web V1</span>
          </div>
          <p className="eyebrow">情绪稳定 · 行动启动 · 成长记录</p>
          <h1>让今天的状态，被温柔接住，也被稳稳推动。</h1>
          <p className="login-lead">
            为当代大学生与更多需要陪伴的人设计：把情绪管理、目标拆解和三喵陪伴放进同一个暖色成长空间。
          </p>
          <blockquote className="login-quote">
            <p>“{quote.text}”</p>
            <cite>{quote.author}</cite>
          </blockquote>
          <div className="login-trust-grid" aria-label="产品能力概览">
            <span>AI 陪伴路由</span>
            <span>任务成长闭环</span>
            <span>情绪价值反馈</span>
          </div>
        </div>

        <div className="login-form-panel">
          <div className="login-panel-head">
            <div>
              <p className="eyebrow">欢迎回来</p>
              <h2>登录知行喵</h2>
            </div>
            <img src={zhixingCat} alt="知行喵" />
          </div>

          <div className="login-cat-preview" aria-label="知行喵状态预览">
            <article>
              <img src={zhixingCozyCat} alt="知行喵撒娇状态" />
              <span>撒娇鼓励</span>
            </article>
            <article>
              <img src={zhixingWinkCat} alt="知行喵眨眼状态" />
              <span>眨眼陪伴</span>
            </article>
          </div>

          <div className="login-type-switch" role="tablist" aria-label="登录方式">
            <button
              type="button"
              className={loginType === "account" ? "active" : ""}
              onClick={() => setLoginType("account")}
            >
              账号密码
            </button>
            <button
              type="button"
              className={loginType === "phone" ? "active" : ""}
              onClick={() => setLoginType("phone")}
            >
              手机验证码
            </button>
          </div>

          <form className="login-form" onSubmit={submitLogin}>
            {loginType === "account" ? (
              <>
                <label>
                  <span>用户名 / 邮箱</span>
                  <input
                    value={account}
                    onChange={(event) => setAccount(event.target.value)}
                    placeholder="例如：zhixingmiao"
                    autoComplete="username"
                  />
                </label>
                <label>
                  <span>密码</span>
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="请输入密码"
                    type="password"
                    autoComplete="current-password"
                  />
                </label>
              </>
            ) : (
              <>
                <label>
                  <span>手机号</span>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="请输入 11 位手机号"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={11}
                  />
                </label>
                <label>
                  <span>验证码</span>
                  <div className="code-row">
                    <input
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                      placeholder="4 位验证码"
                      inputMode="numeric"
                      maxLength={6}
                    />
                    <button type="button" onClick={requestCode}>
                      获取验证码
                    </button>
                  </div>
                </label>
              </>
            )}

            {error && <p className="login-error">{error}</p>}
            {codeNotice && loginType === "phone" && (
              <p className="login-code-notice">{codeNotice}</p>
            )}

            <button type="submit" className="primary-action login-submit">
              进入成长空间
            </button>
          </form>

          <div className="login-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={() => enterApp("guest", "体验用户")}
            >
              游客体验
            </button>
          </div>
          <p className="login-footnote">
            当前 V1 会先进入真实后端游客会话；正式账号鉴权和短信服务将在后续接入。
          </p>
        </div>
      </section>
    </main>
  );
}
