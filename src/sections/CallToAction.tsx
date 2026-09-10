"use client";
import Image from "next/image";
import starImage from "@/assets/star.png";
import springImage from "@/assets/spring.png";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ClassCalendar } from "@/components/ClassCalendar";
import { MapPin, ShoppingBag, Clock } from "lucide-react";

type CallToActionProps = {
  variant?: "booking" | "simple";
};

export const CallToAction = ({ variant = "booking" }: CallToActionProps) => {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const translateY = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const isSimple = variant === "simple";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    interest: variant === "simple" ? "general" : "clase_gratuita",
    horario: "",
    slotIso: "" as string,
    message: "",
    hp_website: "",
    newsletter_opt_in: false,
  });

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const value = e.target instanceof HTMLInputElement && e.target.type === "checkbox"
      ? e.target.checked
      : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const isSlotDateInRange = (slotIso: string): boolean => {
    try {
      const slotDate = new Date(slotIso);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 14);
      const d = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate());
      return d >= tomorrow && d <= maxDate;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!isSimple) {
      if (!formData.horario) {
        setMessage({ type: "error", text: t("cta.errors.select_slot") });
        return;
      }
      if (formData.slotIso && !isSlotDateInRange(formData.slotIso)) {
        setMessage({ type: "error", text: t("cta.errors.invalid_date") });
        return;
      }
    }

    try {
      const emailRes = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: isSimple
            ? formData.message
            : `Reserva de clase gratuita - Horario: ${formData.horario}`,
          interest: formData.interest,
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
          newsletter_opt_in: formData.newsletter_opt_in,
          hp_website: formData.hp_website,
        }),
      });

      if (!emailRes.ok) {
        const data = await emailRes.json().catch(() => ({}));
        const apiError = typeof data?.error === "string" ? data.error : t("callToAction.errorEnviar");
        const apiDetails = typeof data?.details === "string" ? data.details : "";
        const errorText = apiDetails ? `${apiError} (${apiDetails})` : apiError;
        setMessage({ type: "error", text: errorText });
        console.error("Error en la respuesta del API:", emailRes.status, data);
        return;
      }

      setMessage({
        type: "success",
        text: isSimple ? t("callToAction.simple.mensajeEnviado") : t("callToAction.mensajeEnviado"),
      });
      setFormData({
        name: "",
        email: "",
        interest: isSimple ? "general" : "clase_gratuita",
        horario: "",
        slotIso: "",
        message: "",
        hp_website: "",
        newsletter_opt_in: false,
      });
    } catch (error) {
      setMessage({ type: "error", text: t("callToAction.errorRed") });
      console.error("Error al enviar el formulario:", error);
    }
  };

  return (
    <section
      id={isSimple ? "contact" : "contacta"}
      ref={sectionRef}
      className="scroll-mt-28 bg-gradient-to-b from-white to-[#D2DCFF] py-24 overflow-x-clip relative"
    >
      <div className="container text-center relative">
        <div className="section-heading relative">
          <h2 className="section-title text-4xl md:text-5xl font-bold mb-2">
            {isSimple ? t("callToAction.simple.titulo") : t("callToAction.titulo")}
          </h2>
          <p className="text-lg md:text-xl text-gray-700 mb-8">
            {isSimple ? t("callToAction.simple.subtitulo") : t("callToAction.subtitulo")}
          </p>
          <motion.div style={{ translateY }} className="hidden md:block absolute -left-16 top-0">
            <Image src={starImage} alt="" width={80} className="opacity-70" />
          </motion.div>
          <motion.div style={{ translateY }} className="hidden md:block absolute -right-8 bottom-0">
            <Image src={springImage} alt="" width={80} className="opacity-70" />
          </motion.div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto mt-12 bg-white shadow-lg rounded-lg p-8 text-left"
        >
          {message && (
            <>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 mb-4 rounded-lg text-center font-semibold ${
                  message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
                role="alert"
              >
                {message.text}
              </motion.div>
              {!isSimple && message.type === "success" && (
                <div className="flex flex-col items-center gap-3 mb-4">
                  <p className="text-center text-sm text-gray-600">{t("cta.whatsapp_note")}</p>
                  <motion.a
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "34600000000"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-[#20BD5A] transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    {t("cta.contact_whatsapp")}
                  </motion.a>
                </div>
              )}
            </>
          )}

          {!isSimple && (
            <>
              <div className="mb-8">
                <ClassCalendar
                  onSlotSelect={(slot, slotIso) => {
                    setFormData((prev) => ({ ...prev, horario: slot, slotIso: slotIso ?? "" }));
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex flex-col gap-2 p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-800 font-semibold">
                    <MapPin className="h-5 w-5 shrink-0 text-[#001738]" aria-hidden />
                    <span>{t("cta.location_title")}</span>
                  </div>
                  <a
                    href="https://www.google.com/maps/search/Biblioteca+Jaume+Fuster+Lesseps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {t("cta.location_val")}
                  </a>
                  <span className="text-sm text-gray-600"> {t("cta.location_negotiable")}</span>
                </div>
                <div className="flex flex-col gap-2 p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-800 font-semibold">
                    <ShoppingBag className="h-5 w-5 shrink-0 text-[#001738]" aria-hidden />
                    <span>{t("cta.bring_title")}</span>
                  </div>
                  <p className="text-sm text-gray-700">{t("cta.bring_val")}</p>
                </div>
                <div className="flex flex-col gap-2 p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-2 text-gray-800 font-semibold">
                    <Clock className="h-5 w-5 shrink-0 text-[#001738]" aria-hidden />
                    <span>{t("cta.policy_title")}</span>
                  </div>
                  <p className="text-sm text-gray-700">{t("cta.policy_val")}</p>
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                {t("callToAction.nombre")}
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                {t("callToAction.email")}
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="interest">
                Interest
              </label>
              <select
                id="interest"
                name="interest"
                value={formData.interest}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="general">General inquiry</option>
                <option value="clase_gratuita">Free class</option>
                <option value="tutoring">Tutoring</option>
                <option value="web_development">Web development</option>
              </select>
            </div>
            <label className="flex items-center gap-3 mt-7 text-gray-700">
              <input
                type="checkbox"
                name="newsletter_opt_in"
                checked={formData.newsletter_opt_in}
                onChange={handleChange}
                className="h-4 w-4"
              />
              <span>Subscribe me to the newsletter</span>
            </label>
          </div>

          {isSimple && (
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                {t("callToAction.simple.mensaje")}
              </label>
              <motion.textarea
                whileFocus={{ scale: 1.01 }}
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y"
              />
            </div>
          )}

          <input
            type="text"
            name="hp_website"
            value={formData.hp_website}
            onChange={handleChange}
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="flex justify-center">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#001738] text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-[#002d6d] transition-all duration-300 flex items-center gap-2"
            >
              <span>{isSimple ? t("callToAction.simple.enviar") : t("callToAction.enviar")}</span>
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </form>
      </div>
    </section>
  );
};
