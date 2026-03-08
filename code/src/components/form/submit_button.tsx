import { useFormContext } from "@/components/form/form"
import { Button } from "@/components/ui/button"

export function SubmitButton({ label, submittingLabel }: { label: string | React.ReactNode, submittingLabel?: string | React.ReactNode }) {
    const form = useFormContext()
    return (
        <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
                <Button type="submit" className="w-full" disabled={isSubmitting} onClick={() => form.handleSubmit({ submitAction: 'continue' })}>
                    {isSubmitting ? submittingLabel || label : label}
                </Button>
            )}
        />
    )
}