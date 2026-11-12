"use client";

import { useState, type FormEvent } from "react";

// The support form does not store anything on the server. On submit it opens
// the visitor's own email app with the message addressed to the support inbox,
// so nothing is lost and no database or mail service is needed.
// (It replaces the template's "mail.php" form, which had no handler.)

const TOPICS = [
  "Course question",
  "Access to my learning account",
  "Upcoming course dates",
  "Job Portal question",
  "Technical issue on the website",
  "Other",
];

export default function SupportEmailForm({ email, sendIcon }: { email: string; sendIcon: React.ReactNode }) {
  const [opened, setOpened] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const topic = String(f.get("subject") || "Question");
    const message = String(f.get("message") || "").trim();
    const subject = `${topic} — World Teachers Academy`;
    const body = `${message}\n\n—\nName: ${name}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  }

  return (
    <form onSubmit={onSubmit} className="contact-form">
      <div className="title-area">
        <span className="sub-title text-theme">
          <img src="/assets/img/icon/subtitle-icon1-6.svg" alt="" />
          Write to Us
        </span>
        <h2 className="sec-title">
          <span className="th-text-perspective">Tell Us What You Need</span>
        </h2>
        <p className="wta-support-note">
          Pressing the button opens your email app with your message ready to send to{" "}
          <a href={`mailto:${email}`}>{email}</a>. You can check it before sending.
        </p>
      </div>
      <div className="row">
        <div className="col-md-6 form-group style-border3">
          <label className="visually-hidden" htmlFor="support-name">Your name</label>
          <input id="support-name" type="text" placeholder="Your Name" className="form-control" name="name" required autoComplete="name" />
          <i className="fal fa-user"></i>
        </div>
        <div className="col-md-6 form-group style-border3">
          <label className="visually-hidden" htmlFor="support-subject">Topic</label>
          <select id="support-subject" name="subject" className="form-select" defaultValue="" required>
            <option value="" disabled hidden>What&apos;s this about?</option>
            {TOPICS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <i className="fal fa-chevron-down"></i>
        </div>
        <div className="col-12 form-group style-border3">
          <label className="visually-hidden" htmlFor="support-message">Your message</label>
          <textarea
            id="support-message"
            name="message"
            rows={5}
            className="form-control"
            required
            placeholder="Your question. If it's about a course, include the course name and the email address you enrolled with."
          ></textarea>
          <i className="fal fa-pencil"></i>
        </div>
        <div className="form-btn mt-15 col-12">
          <button className="th-btn" type="submit">
            OPEN IN MY EMAIL APP
            {sendIcon}
          </button>
        </div>
      </div>
      <p className="form-messages mb-0 mt-3" role="status">
        {opened ? (
          <>
            Your email app should now be open. If nothing happened, email us directly at{" "}
            <a href={`mailto:${email}`}>{email}</a>.
          </>
        ) : null}
      </p>
    </form>
  );
}
