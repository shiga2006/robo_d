import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Map, Cpu, Wifi, Shield, Zap } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();

    const features = [
        {
            icon: Map,
            title: 'Interactive Floor Plans',
            description: 'Upload and manage your facility maps with precision waypoint navigation.'
        },
        {
            icon: Bot,
            title: 'Multi-Robot Fleet',
            description: 'Monitor and control multiple autonomous robots in real-time.'
        },
        {
            icon: Cpu,
            title: 'Edge AI Processing',
            description: 'Intelligent path planning and obstacle avoidance powered by edge computing.'
        },
        {
            icon: Wifi,
            title: 'Real-Time Telemetry',
            description: 'Live updates on robot status, battery levels, and operational metrics.'
        },
        {
            icon: Shield,
            title: 'Secure Authentication',
            description: 'Protected access with JWT-based authentication and data isolation.'
        },
        {
            icon: Zap,
            title: 'Instant Deployment',
            description: 'Quick setup with local MongoDB and Node.js backend.'
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <div className="text-center space-y-6">
                        <div className="flex justify-center mb-8">
                            <div className="p-4 rounded-full bg-primary/10 ring-2 ring-primary/20">
                                <Cpu className="h-16 w-16 text-primary" />
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                                Navigo
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                            Industrial Autonomous Robot Fleet Management System
                        </p>

                        <p className="text-base md:text-lg text-muted-foreground/80 max-w-2xl mx-auto">
                            A sophisticated platform for managing autonomous material handling robots with real-time monitoring,
                            interactive map navigation, and seamless industry integration.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                            <Button
                                size="lg"
                                onClick={() => navigate('/signup')}
                                className="text-lg px-8 py-6 h-auto"
                            >
                                Get Started
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => navigate('/login')}
                                className="text-lg px-8 py-6 h-auto"
                            >
                                Sign In
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Platform Features</h2>
                    <p className="text-muted-foreground text-lg">
                        Everything you need to manage your robotic fleet
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <feature.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </div>
                                <CardDescription className="text-base">
                                    {feature.description}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-primary/5 border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold">
                            Ready to optimize your operations?
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Join Navigo today and experience the future of industrial automation.
                        </p>
                        <Button
                            size="lg"
                            onClick={() => navigate('/signup')}
                            className="text-lg px-8 py-6 h-auto"
                        >
                            Create Free Account
                        </Button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Cpu className="h-5 w-5 text-primary" />
                            <span className="font-semibold">Navigo</span>
                            <span className="text-muted-foreground text-sm">© 2026</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Industrial Autonomous Robot Fleet Management
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
