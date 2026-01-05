"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Heading, Text, VStack, Progress, useToast } from "@chakra-ui/react";
import { WelcomeStep } from "@/components/setup/WelcomeStep";
import { AdminAccountStep } from "@/components/setup/AdminAccountStep";
import { SiteInfoStep } from "@/components/setup/SiteInfoStep";
import { OrganizationStep } from "@/components/setup/OrganizationStep";
import { EmailConfigStep } from "@/components/setup/EmailConfigStep";

export default function SetupPage() {
    const router = useRouter();
    const toast = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [setupData, setSetupData] = useState<any>({
        admin: {},
        siteInfo: {},
        organization: {},
        email: {},
    });

    const totalSteps = 5;
    const progress = (currentStep / totalSteps) * 100;

    const steps = [
        { number: 1, title: "Welcome" },
        { number: 2, title: "Admin Account" },
        { number: 3, title: "Site Information" },
        { number: 4, title: "Organization" },
        { number: 5, title: "Email Configuration" },
    ];

    const handleNext = (data: any) => {
        setSetupData((prev: any) => ({ ...prev, ...data }));
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            completeSetup({ ...setupData, ...data });
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const completeSetup = async (finalData: any) => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/setup/initialize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalData),
            });

            if (response.ok) {
                toast({
                    title: "Setup completed!",
                    description: "Your blog is ready. Redirecting to dashboard...",
                    status: "success",
                    duration: 3000,
                });
                setTimeout(() => {
                    router.push("/dashboard");
                }, 1500);
            } else {
                const error = await response.json();
                toast({
                    title: "Setup failed",
                    description: error.message || "Please try again",
                    status: "error",
                    duration: 5000,
                });
            }
        } catch (error) {
            toast({
                title: "Setup error",
                description: "An unexpected error occurred",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box minH="100vh" bg="gray.50" py={12}>
            <Container maxW="2xl">
                <VStack spacing={8} align="stretch">
                    <Box textAlign="center">
                        <Heading size="xl" mb={2}>
                            Welcome to Your Blog
                        </Heading>
                        <Text color="gray.600">
                            Let's set up your blog in just a few steps
                        </Text>
                    </Box>

                    <Box bg="white" p={8} borderRadius="lg" shadow="md">
                        <Progress value={progress} mb={8} colorScheme="blue" borderRadius="full" />

                        <VStack spacing={6} align="stretch">
                            <Box>
                                <Text fontSize="sm" color="gray.500" mb={1}>
                                    Step {currentStep} of {totalSteps}
                                </Text>
                                <Heading size="md">{steps[currentStep - 1].title}</Heading>
                            </Box>

                            {currentStep === 1 && <WelcomeStep onNext={handleNext} />}
                            {currentStep === 2 && (
                                <AdminAccountStep
                                    onNext={handleNext}
                                    onBack={handleBack}
                                    initialData={setupData.admin}
                                />
                            )}
                            {currentStep === 3 && (
                                <SiteInfoStep
                                    onNext={handleNext}
                                    onBack={handleBack}
                                    initialData={setupData.siteInfo}
                                />
                            )}
                            {currentStep === 4 && (
                                <OrganizationStep
                                    onNext={handleNext}
                                    onBack={handleBack}
                                    initialData={setupData.organization}
                                />
                            )}
                            {currentStep === 5 && (
                                <EmailConfigStep
                                    onNext={handleNext}
                                    onBack={handleBack}
                                    initialData={setupData.email}
                                />
                            )}
                        </VStack>
                    </Box>
                </VStack>
            </Container>
        </Box>
    );
}
