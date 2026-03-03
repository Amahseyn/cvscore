import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

interface RadarAnalyticsProps {
    metrics: Record<string, number>;
}

export const RadarAnalytics: React.FC<RadarAnalyticsProps> = ({ metrics }) => {
    const data = [
        { subject: "Impact", A: metrics.impact_score || 0, fullMark: 100 },
        { subject: "Technical", A: metrics.technical_depth_score || 0, fullMark: 100 },
        { subject: "Soft Skills", A: metrics.soft_skills_score || 0, fullMark: 100 },
        { subject: "Growth", A: metrics.growth_potential_score || 0, fullMark: 100 },
        { subject: "Stability", A: metrics.stability_score || 0, fullMark: 100 },
        { subject: "Readability", A: metrics.readability_score || 0, fullMark: 100 },
    ];

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }} />
                    <Radar
                        name="Candidate"
                        dataKey="A"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.5}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};
