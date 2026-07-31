import { Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "@/components/site/Reveal";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { adminService } from "@/services/adminService";
import { brand, contact } from "@/lib/site-config";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9\s-]{10,15}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email address").max(255),
  message: z.string().trim().min(5, "Please write a short message").max(1000),
});

type Errors = Partial<Record<keyof z.infer<typeof schema>, string>>;

export function Contact() {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parsed = schema.safeParse({
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      message: String(fd.get("message") ?? ""),
    });

    if (!parsed.success) {
      const next: Errors = {};
      parsed.error.issues.forEach((i) => {
        next[i.path[0] as keyof Errors] = i.message;
      });
      setErrors(next);
      toast.error("Please check the highlighted fields.");
      return;
    }

    setErrors({});
    if (!isSupabaseConfigured) {
      toast.error("Messaging is not available right now. Please call us instead.");
      return;
    }
    try {
      await adminService.submitMessage(parsed.data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not send your message. Please call us.",
      );
      return;
    }
    setSent(true);
    form.reset();
    toast.success("Thanks! Your message has reached our team. We'll call you back shortly.");
  };

  return (
    <section id="contact" className="scroll-mt-24 bg-surface py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <h2 className="text-3xl font-extrabold sm:text-4xl">Need Help With Your Order?</h2>
          <p className="mt-4 text-muted-foreground">
            Call us or send a message below — we'll help you place or track your order.
          </p>

          <div className="card-premium mt-8 p-6">
            <p className="font-display text-lg font-bold text-secondary">{brand.company}</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" aria-hidden="true" /> {brand.address}
            </p>
            <ul className="mt-4 space-y-2">
              {contact.phones.map((p) => (
                <li key={p}>
                  <a
                    href={`tel:${p.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 font-semibold text-foreground hover:text-primary"
                  >
                    <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
                    {p}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-full">
                <a href={`tel:${(contact.phones[0] ?? "").replace(/\s/g, "")}`}>Call Now</a>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <a href={`mailto:${contact.email}`}>Email Us</a>
              </Button>
            </div>
          </div>
        </Reveal>

        <Reveal className="card-premium p-6 sm:p-8">
          <h3 className="text-xl font-bold">Send us a message</h3>
          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" autoComplete="name" className="mt-1.5" />
              {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" inputMode="tel" autoComplete="tel" className="mt-1.5" />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" className="mt-1.5" />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" rows={4} className="mt-1.5" />
              {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
            </div>
            <Button type="submit" size="lg" className="w-full rounded-full">
              Submit
            </Button>
            <p aria-live="polite" className="min-h-5 text-sm text-primary">
              {sent ? "Message received — thank you for reaching out!" : ""}
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
