import { Button } from "@/components/ui/button";
import SetupCard from "@/components/setup/setup_card";
import { useAppForm } from "@/components/form/form";
import { BasicInfoSchema } from "@/lib/zod_schemas/profile_setup_schema";

type BasicInfoStepProps = {
    form: ReturnType<typeof useAppForm>;
    onNext: () => void;
};

export default function BasicInfoStep({
    form,
    onNext,
}: BasicInfoStepProps) {
    const validateAndContinue = async () => {
        const result = await form.validateAllFields("submit");

        if (result.length == 0) {
            onNext();
        }
    };

    return (
        <SetupCard
            title="Basic Information"
            description="Tell us a little about yourself."
            footer={
                <div className="w-full flex justify-end">
                    <Button type="button" onClick={validateAndContinue}>
                        Continue
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                <form.AppField
                    name="weight"
                    validators={{
                        onBlur: BasicInfoSchema.shape.weight
                    }}
                    children={(field) =>
                        <field.NumberField
                            label="Weight"
                            placeholder="Enter your weight"
                            required
                        />
                    }
                />
                <form.AppField
                    name="height"
                    validators={{
                        onBlur: BasicInfoSchema.shape.height
                    }}
                    children={(field) =>
                        <field.NumberField
                            label="Height"
                            placeholder="Enter your height"
                            required
                        />
                    }
                />
                <form.AppField
                    name="dob"
                    validators={{
                        onBlur: BasicInfoSchema.shape.dob
                    }}
                    children={(field) =>
                        <field.DateField
                            label="Date of Birth"
                            calendarProps={{
                                disabled: { after: new Date() }
                            }}
                            required
                        />
                    }
                />
                <form.AppField
                    name="occupation"
                    validators={{
                        onBlur: BasicInfoSchema.shape.occupation
                    }}
                    children={(field) =>
                        <field.TextField
                            label="Occupation"
                            placeholder="Enter your occupation"
                            required
                        />
                    }
                />
            </div>
        </SetupCard>
    );
}