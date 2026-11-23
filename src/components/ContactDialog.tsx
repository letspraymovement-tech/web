import { useEffect, useRef } from "react";
export type ContactTopic = "community" | "prayer" | "giving";
const topics = {
  community: {
    title: "Join the prayer community",
    text: "Get in touch with the Let’s Pray team to receive the current WhatsApp community invitation.",
    subject: "WhatsApp community invitation",
  },
  prayer: {
    title: "Send a prayer request",
    text: "Share your request with the prayer team by email. You can ask for your request to remain confidential.",
    subject: "Confidential prayer request",
  },
  giving: {
    title: "Support the assignment",
    text: "Contact the Let’s Pray team for the current giving details and ways to support the movement.",
    subject: "Giving enquiry",
  },
};
export function ContactDialog({
  topic,
  onClose,
}: {
  topic: ContactTopic;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, []);
  const content = topics[topic];
  return (
    <dialog
      ref={ref}
      className="contact-dialog"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="dialog-title"
    >
      <button
        className="dialog-close"
        aria-label="Close dialog"
        onClick={onClose}
      >
        ×
      </button>
      <h2 id="dialog-title">{content.title}</h2>
      <p>{content.text}</p>
      <a
        className="button"
        href={`mailto:letspraymovement4@gmail.com?subject=${encodeURIComponent(content.subject)}`}
      >
        Email the team <span aria-hidden="true">↗</span>
      </a>
      <p className="dialog-email">letspraymovement4@gmail.com</p>
    </dialog>
  );
}
