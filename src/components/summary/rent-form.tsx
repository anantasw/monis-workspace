"use client";

import { useActionState, useEffect, useId, useRef, type ComponentProps, type ReactNode } from "react";
import { submitRentRequest, type RentFormState } from "@/app/actions";
import { formatUsd, pluralize } from "@/domain/format";
import { setupMessage, whatsappUrl } from "@/domain/messages";
import { DELIVERY_AREAS, type RentField } from "@/domain/rent-request";
import { priceSetup } from "@/domain/setup";
import { encodeSetup } from "@/domain/share-link";
import { useLight } from "@/components/builder/light-context";
import { useSetup, useSetupActions } from "@/components/builder/setup-context";

const initialState: RentFormState = { status: "idle" };

const inputClass =
  "mt-1 block w-full rounded-control border border-line bg-surface px-3 py-2.5 text-[15px] text-ink outline-none transition-[border-color,box-shadow] focus:border-brand focus:ring-2 focus:ring-brand/20 aria-[invalid=true]:border-danger";

interface ControlA11y {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
}

interface FieldProps {
  label: string;
  optional?: boolean;
  errors?: string[];
  children: (a11y: ControlA11y) => ReactNode;
}

/** Label, control and error message, wired together for screen readers. */
function Field({ label, optional, errors, children }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const error = errors?.at(0);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label} {optional ? <span className="font-normal text-ink-muted">(optional)</span> : null}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": error ? errorId : undefined })}
      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function TextInput(props: ComponentProps<"input">) {
  return <input {...props} className={inputClass} />;
}

function Confirmation({ reference, whatsappNumber }: { reference: string; whatsappNumber: string | null }) {
  const setup = useSetup();
  const { shareUrl } = useSetupActions();
  const price = priceSetup(setup);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // The form is gone: move focus to the confirmation so keyboard and screen reader users land on it.
  useEffect(() => headingRef.current?.focus(), []);
  return (
    <div className="rounded-ticket bg-paper p-6" role="status">
      <h3 ref={headingRef} tabIndex={-1} className="font-note text-3xl text-brand outline-none">
        Terima kasih!
      </h3>
      <p className="mt-2 text-ink">
        Your request <span className="font-semibold tabular-nums">{reference}</span> is in. monis.rent will confirm the
        delivery by email or WhatsApp within one working day.
      </p>
      <p className="mt-3 text-sm tabular-nums text-ink-muted">
        {pluralize(price.itemCount, "item")} · {formatUsd(price.weeklyCents)} per week · {pluralize(setup.weeks, "week")}
      </p>
      {whatsappNumber ? (
        <a
          href={whatsappUrl(whatsappNumber, setupMessage(setup, shareUrl(), reference))}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-control bg-leaf px-4 py-2.5 text-sm font-semibold text-white hover:bg-leaf/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Send a copy on WhatsApp
        </a>
      ) : null}
    </div>
  );
}

export function RentForm({ whatsappNumber }: { whatsappNumber: string | null }) {
  const setup = useSetup();
  const {
    state: { today },
  } = useLight();
  const [state, formAction, pending] = useActionState(submitRentRequest, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // After a failed submit, put focus on the first field that needs fixing.
  useEffect(() => {
    if (state.status === "error") formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  if (state.status === "ok") return <Confirmation reference={state.reference} whatsappNumber={whatsappNumber} />;

  const errors: Partial<Record<RentField, string[]>> = state.status === "error" ? state.fieldErrors : {};
  const values: Partial<Record<RentField, string>> = state.status === "error" ? state.values : {};

  return (
    // key: remount with the returned values, because React resets a form after its action runs.
    <form ref={formRef} key={JSON.stringify(values)} action={formAction} noValidate className="relative space-y-4 rounded-ticket border border-line p-5">
      <input type="hidden" name="setup" value={encodeSetup(setup)} />
      {/* Honeypot for bots: hidden from people and from screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      {state.status === "error" ? (
        <p role="alert" className="rounded-control bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.message}
          {errors.setup ? ` ${errors.setup.at(0)}` : ""}
        </p>
      ) : null}

      <Field label="Name" errors={errors.name}>
        {(a11y) => <TextInput {...a11y} name="name" autoComplete="name" required maxLength={80} defaultValue={values.name} />}
      </Field>

      <Field label="Email" errors={errors.email}>
        {(a11y) => (
          <TextInput
            {...a11y}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            spellCheck={false}
            defaultValue={values.email}
          />
        )}
      </Field>

      <Field label="WhatsApp" optional errors={errors.whatsapp}>
        {(a11y) => (
          <TextInput
            {...a11y}
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+62 812 3456 7890"
            defaultValue={values.whatsapp}
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Field label="Delivery area" errors={errors.area}>
          {(a11y) => (
            <select {...a11y} name="area" required defaultValue={values.area ?? ""} className={`select ${inputClass}`}>
              <option value="" disabled>
                Choose…
              </option>
              {DELIVERY_AREAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Delivery date" errors={errors.date}>
          {(a11y) => <TextInput {...a11y} name="date" type="date" required min={today ?? undefined} defaultValue={values.date} />}
        </Field>
      </div>

      <Field label="Note" optional errors={errors.note}>
        {(a11y) => (
          <textarea
            {...a11y}
            name="note"
            rows={3}
            maxLength={500}
            className={inputClass}
            placeholder="Villa name, gate code, best time…"
            defaultValue={values.note}
          />
        )}
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-control bg-brand px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60"
      >
        {pending ? "Sending…" : `Rent this setup for ${formatUsd(priceSetup(setup).weeklyCents)}/week`}
      </button>
      <p className="text-center text-xs text-ink-muted">No payment now. monis.rent confirms stock and delivery first.</p>
    </form>
  );
}
