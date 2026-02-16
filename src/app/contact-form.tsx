"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { BsSend } from "react-icons/bs";
import { VscError } from "react-icons/vsc";
import PhoneInput from 'react-phone-number-input';
import { z } from "zod";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "../components/ui/input-otp";
import { Button } from "../components/button";
import LoadingSpinner from "../components/loading-spinner";
import { SectionTitle } from "../components/section-title";

export const ContactForm = () => {
  const t = useTranslations("ContactForm");
  const locale = useLocale();
  const [parent] = useAutoAnimate();
  const [token, setToken] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const contactFormSchema = z.object({
    name: z.string().nonempty({ message: t("NameEmptyErrorMsg") }).min(2, t("NameShortErrorMsg")),
    email: z.string().nonempty({ message: t("EmailEmptyErrorMsg") }).email(t("EmailNotValidMsg")),
    phone: z.string().nonempty({ message: t("PhoneNumberEmptyErrorMsg") }),
    otp: z.string().length(6, { message: "O código deve ter 6 dígitos" }),
    message: z.string().nonempty({ message: t("MessageEmptyErrorMsg") }).min(20, t("MessageShortMsg")),
    token: z.string()
  });

  type ContactFormProps = z.infer<typeof contactFormSchema>;

  const { handleSubmit, register, control, getValues, setValue, reset, formState: { isSubmitting, errors } } = useForm<ContactFormProps>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", phone: "", otp: "", message: "", token: "" }
  });

  const [showOTP, setShowOTP] = useState(false) // or however you track OTP visibility

  useEffect(() => {
    if (showOTP) {
      // Wait for the component to render
      setTimeout(() => {
        // Find the OTP's contenteditable element and focus it
        const otpInput = document.querySelector('[contenteditable]');
        if (otpInput) {
          (otpInput as HTMLElement).focus();
        }
      }, 50);
    }
  }, [showOTP]);

  const handleSendOtp = async () => {
    const email = getValues("email");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Insira um e-mail válido primeiro");
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await fetch(`/${locale}/api/send-otp`, {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setValue("token", data.token);
        toast.success("Código enviado para o seu e-mail!");
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Erro ao enviar código");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const onSubmit = async (data: ContactFormProps) => {
    try {
      const response = await fetch(`/${locale}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error();

      toast.success(t("ToastSuccess"));
      reset();
      setToken("");
    } catch (error) {
      toast.error("Código inválido ou erro no envio.");
    }
  };

  const formItemsAnimationProps = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section id="contact" className="relative py-8 sm:py-16 px-6 flex items-center justify-center bg-transparent overflow-visible">
      <div className="relative z-10 w-full mx-auto max-w-[500px] border border-blue-600 rounded-xl px-4 md:px-6 py-8 backdrop-blur-[2px] bg-[#070D51]/50">
        <SectionTitle
          title={t("Title")}
          subtitle={t("SubtitleOne")}
          extraSubtitle={t("SubtitleTwo")}
          className="items-center text-center tracking-wider font-thin"
        />

        <motion.form
          className="flex flex-col gap-4 mt-12 w-full"
          onSubmit={handleSubmit(onSubmit)}
          initial="hidden"
          animate="show"
          variants={{
            show: { transition: { staggerChildren: 0.1 } }
          }}
        >
          {/* NOME */}
          <motion.div variants={formItemsAnimationProps}>
            <input
              {...register("name")}
              placeholder={t("Name")}
              className="w-full h-14 bg-gray-800 rounded-lg text-gray-50 p-4 focus:outline-none focus:ring-1 ring-blue-600 font-thin tracking-wider transition-shadow"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><VscError /> {errors.name.message}</p>}
          </motion.div>

          {/* EMAIL + BOTÃO OTP */}
          <motion.div variants={formItemsAnimationProps} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                {...register("email")}
                placeholder={t("Email")}
                className="flex-1 h-14 bg-gray-800 rounded-lg text-gray-50 p-4 focus:outline-none focus:ring-1 ring-blue-600 font-thin tracking-wider transition-shadow"
              />
              <Button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp}
                className="h-14 px-4 whitespace-nowrap text-xs md:text-sm"
              >
                {isSendingOtp ? t("SendingCode") : t("VerifyEmailBtn")}
              </Button>
            </div>
            {errors.email && <p className="text-red-500 text-xs flex items-center gap-1"><VscError /> {errors.email.message}</p>}
          </motion.div>

          {/* INPUT OTP SHADCN */}
          {token && (
            <motion.div variants={formItemsAnimationProps} className="flex flex-col gap-3 items-center pt-2 pb-4 bg-blue-500/5 rounded-lg border border-blue-600">
              <label className="text-sm font-light text-white">{t("InsertOtpCodeSent")}</label>
              <Controller
                name="otp"
                control={control}
                render={({ field }) => (
                  <InputOTP
                    maxLength={6}
                    autoFocus
                    {...field}
                    // CRITICAL: Add container ref + focus management
                    containerClassName="otp-container"
                  >
                    <InputOTPGroup className="gap-2">
                      {[...Array(6)].map((_, i) => (
                        <InputOTPSlot key={i} index={i} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                )}
              />
            </motion.div>
          )}

          {/* WHATSAPP */}
          <motion.div variants={formItemsAnimationProps}>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  {...field}
                  defaultCountry="BR"
                  placeholder={t("YourWhatsAppNumber")}
                  className="phone-input-custom"
                />
              )}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </motion.div>

          {/* MENSAGEM */}
          <motion.div variants={formItemsAnimationProps}>
            <textarea
              {...register("message")}
              placeholder={t("Message")}
              className="w-full h-[120px] resize-none bg-gray-800 rounded-lg text-gray-50 p-4 focus:outline-none focus:ring-1 ring-blue-600 font-thin tracking-wider transition-shadow"
            />
            {errors.message && <p className="text-red-500 text-xs flex items-center gap-1"><VscError /> {errors.message.message}</p>}
          </motion.div>

          {/* BOTÃO SUBMIT */}
          <motion.div variants={formItemsAnimationProps}>
            <Button
              className="h-14 tracking-wider font-normal flex items-center justify-center gap-2 shadow-button w-full"
              disabled={isSubmitting || !token}
            >
              {isSubmitting ? (
                <LoadingSpinner />
              ) : (
                <>
                  {t("ButtonText")}
                  <BsSend className="rotate-45" />
                </>
              )}
            </Button>
            {!token && <p className="text-[10px] text-gray-400 text-center mt-2 italic">{t("EmailValidateWarning")}</p>}
          </motion.div>
        </motion.form>
      </div>
    </section>
  );
};
