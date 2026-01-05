"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Heading, Text, VStack, Progress } from "@chakra-ui/react";

export default function SetupPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [setupData, setSetupData] = useState({
        admin: {},
        siteInfo: {},
        organization: {},
        email: {},
    });

    const totalSteps = 5;
    const progress = (currentStep / totalSteps) * 100;

    const steps = [
        { number: 1, title: "Welcome", component: null },
        { number: 2, title: "Admin Account", component: null },
        { number: 3, title: "Site Information", component: null },
        { number: 4, title: "Organization", component: null },
        { number: 5, title: "Email Configuration", component: null },
    ];

    const handleNext = (data: any) => {
        setSetupData((prev) => ({ ...prev, ...data }));
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            completeSetup();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const completeSetup = async () => {
        try {
            const response = await fetch("/api/setup/initialize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(setupData),
            });

            if (response.ok) {
                router.push("/dashboard");
            } else {
                const error = await response.json();
                console.error("Setup failed:", error);
            }
        } catch (error) {
            console.error("Setup error:", error);
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
                        <Progress value={progress} mb={8} colorScheme="blue" />

                        <VStack spacing={6} align="stretch">
                            <Box>
                                <Text fontSize="sm" color="gray.500" mb={1}>
                                    Step {currentStep} of {totalSteps}
                                </Text>
                                <Heading size="md">{steps[currentStep - 1].title}</Heading>
                            </Box>

                            {/* Step components will be rendered here */}
                            {currentStep === 1 && (
                                <WelcomeStep onNext={handleNext} />
                            )}
                            {currentStep === 2 && (
                                <AdminAccountStep onNext={handleNext} onBack={handleBack} />
                            )}
                            {currentStep === 3 && (
                                <SiteInfoStep onNext={handleNext} onBack={handleBack} />
                            )}
                            {currentStep === 4 && (
                                <OrganizationStep onNext={handleNext} onBack={handleBack} />
                            )}
                            {currentStep === 5 && (
                                <EmailConfigStep onNext={handleNext} onBack={handleBack} />
                            )}
                        </VStack>
                    </Box>
                </VStack>
            </Container>
        </Box>
    );
}

// Placeholder components - will be created separately
function WelcomeStep({ onNext }: { onNext: (data: any) => void }) {
    return (
        <VStack spacing={4}>
            <Text>Welcome to the setup wizard!</Text>
            <button onClick={() => onNext({})}>Get Started</button>
        </VStack>
    );
}

function AdminAccountStep({ onNext, onBack }: any) {
    return <div>Admin Account Step</div>;
}

function SiteInfoStep({ onNext, onBack }: any) {
    return <div>Site Info Step</div>;
}

function OrganizationStep({ onNext, onBack }: any) {
    return <div>Organization Step</div>;
}

function EmailConfigStep({ onNext, onBack }: any) {
    return <div>Email Config Step</div>;
}
