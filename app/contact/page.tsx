import { CmsPageView } from "@/components/common/CmsPageView";
import { ContactForm } from "@/components/forms/ContactForm";

export default function ContactPage() {
  return <CmsPageView slug="contact" title="Contact" extra={<ContactForm />} />;
}
