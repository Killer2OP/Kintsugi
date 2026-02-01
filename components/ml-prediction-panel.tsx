"use client";

import * as React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Brain,
    TrendingUp,
    Target,
    AlertTriangle,
    CheckCircle,
    RefreshCw,
    Sparkles,
} from "lucide-react";

interface MLPrediction {
    predicted_success_rate: number;
    confidence: number;
    reasoning: string[];
    risk_factors: string[];
    recommendations: string[];
}

export function MLPredictionPanel() {
    const [errorLog, setErrorLog] = React.useState("");
    const [suggestedFix, setSuggestedFix] = React.useState("");
    const [errorType, setErrorType] = React.useState("");
    const [prediction, setPrediction] = React.useState<MLPrediction | null>(
        null
    );
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handlePredict = async () => {
        if (!errorLog.trim() || !suggestedFix.trim()) {
            setError("Please provide both error log and suggested fix");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/analytics/ml/predict-success", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    error_log: errorLog,
                    suggested_fix: suggestedFix,
                    error_type: errorType || undefined,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get prediction");
            }

            const data = await response.json();
            setPrediction(data.prediction);
        } catch (err) {
            setError("Failed to get ML prediction. Please try again.");
            console.error("Prediction error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const getSuccessRateColor = (rate: number) => {
        if (rate >= 0.8) return "text-green-600 dark:text-green-400";
        if (rate >= 0.6) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return "text-green-600 dark:text-green-400";
        if (confidence >= 0.6) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    ML Success Prediction
                </CardTitle>
                <CardDescription>
                    Predict the likelihood of fix success using machine learning
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4">
                    <div>
                        <Label htmlFor="error-log">Error Log</Label>
                        <Textarea
                            id="error-log"
                            placeholder="Paste the error log from the failed CI/CD run..."
                            value={errorLog}
                            onChange={(e) => setErrorLog(e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div>
                        <Label htmlFor="suggested-fix">Suggested Fix</Label>
                        <Textarea
                            id="suggested-fix"
                            placeholder="Describe the proposed fix or paste the fix code..."
                            value={suggestedFix}
                            onChange={(e) => setSuggestedFix(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label htmlFor="error-type">
                            Error Type (Optional)
                        </Label>
                        <Select value={errorType} onValueChange={setErrorType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select error type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="build_failure">
                                    Build Failure
                                </SelectItem>
                                <SelectItem value="test_failure">
                                    Test Failure
                                </SelectItem>
                                <SelectItem value="dependency_error">
                                    Dependency Error
                                </SelectItem>
                                <SelectItem value="timeout">Timeout</SelectItem>
                                <SelectItem value="deployment_error">
                                    Deployment Error
                                </SelectItem>
                                <SelectItem value="configuration_error">
                                    Configuration Error
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handlePredict}
                        disabled={
                            isLoading ||
                            !errorLog.trim() ||
                            !suggestedFix.trim()
                        }
                        className="w-full"
                    >
                        {isLoading ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Predict Success Rate
                            </>
                        )}
                    </Button>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded p-3">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                            <p className="text-sm text-red-800 dark:text-red-300">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {prediction && (
                    <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-medium flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Prediction Results
                        </h4>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded">
                                <div
                                    className={`text-2xl font-bold ${getSuccessRateColor(
                                        prediction.predicted_success_rate
                                    )}`}
                                >
                                    {Math.round(
                                        prediction.predicted_success_rate * 100
                                    )}
                                    %
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Predicted Success Rate
                                </p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded">
                                <div
                                    className={`text-2xl font-bold ${getConfidenceColor(
                                        prediction.confidence
                                    )}`}
                                >
                                    {Math.round(prediction.confidence * 100)}%
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Confidence Level
                                </p>
                            </div>
                        </div>

                        {prediction.reasoning &&
                            prediction.reasoning.length > 0 && (
                                <div>
                                    <h5 className="font-medium mb-2 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        Positive Factors
                                    </h5>
                                    <ul className="space-y-1">
                                        {prediction.reasoning.map(
                                            (reason, index) => (
                                                <li
                                                    key={index}
                                                    className="text-sm text-green-800 dark:text-green-200 bg-green-50 dark:bg-green-950/30 p-2 rounded"
                                                >
                                                    • {reason}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            )}

                        {prediction.risk_factors &&
                            prediction.risk_factors.length > 0 && (
                                <div>
                                    <h5 className="font-medium mb-2 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                        Risk Factors
                                    </h5>
                                    <ul className="space-y-1">
                                        {prediction.risk_factors.map(
                                            (risk, index) => (
                                                <li
                                                    key={index}
                                                    className="text-sm text-red-800 dark:text-red-200 bg-red-50 dark:bg-red-950/30 p-2 rounded"
                                                >
                                                    • {risk}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            )}

                        {prediction.recommendations &&
                            prediction.recommendations.length > 0 && (
                                <div>
                                    <h5 className="font-medium mb-2 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        Recommendations
                                    </h5>
                                    <ul className="space-y-1">
                                        {prediction.recommendations.map(
                                            (rec, index) => (
                                                <li
                                                    key={index}
                                                    className="text-sm text-blue-800 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/30 p-2 rounded"
                                                >
                                                    • {rec}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            )}

                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded">
                            <h5 className="font-medium mb-2">Interpretation</h5>
                            <p className="text-sm text-muted-foreground">
                                {prediction.predicted_success_rate >= 0.8
                                    ? "🟢 High likelihood of success - This fix is very likely to resolve the issue."
                                    : prediction.predicted_success_rate >= 0.6
                                    ? "🟡 Moderate likelihood of success - This fix has a reasonable chance of working, but consider the risk factors."
                                    : "🔴 Low likelihood of success - This fix may not work as expected. Review the risk factors and consider alternative approaches."}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
