/**
 * Data Quality Dashboard Component
 * Displays data integrity metrics and provides optimization tools
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    AlertTriangle,
    CheckCircle2,
    RefreshCw,
    Shield,
    TrendingUp,
    Database,
    AlertCircle,
} from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';
import { cn } from '@/lib/utils';

export function DataQualityDashboard() {
    const {
        stats,
        qualityReport,
        runQualityCheck,
        deduplicateAllData,
        isRefreshing,
    } = useAdminData();

    const getQualityColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getQualityBadge = (score: number) => {
        if (score >= 90) return { variant: 'default' as const, label: 'Excellent' };
        if (score >= 70) return { variant: 'secondary' as const, label: 'Good' };
        return { variant: 'destructive' as const, label: 'Needs Attention' };
    };

    const quality = getQualityBadge(stats.dataQualityScore);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Data Quality</h2>
                    <p className="text-muted-foreground">
                        Monitor and optimize your portfolio data integrity
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={runQualityCheck}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')} />
                        Run Check
                    </Button>
                    <Button
                        variant="outline"
                        onClick={deduplicateAllData}
                        disabled={isRefreshing}
                    >
                        <Database className="mr-2 h-4 w-4" />
                        Optimize
                    </Button>
                </div>
            </div>

            {/* Quality Score Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Overall Data Quality Score
                        </CardTitle>
                        <Badge variant={quality.variant}>{quality.label}</Badge>
                    </div>
                    <CardDescription>
                        Based on data integrity, consistency, and completeness
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className={cn('text-5xl font-bold', getQualityColor(stats.dataQualityScore))}>
                                {stats.dataQualityScore}%
                            </span>
                            <TrendingUp className={cn('h-8 w-8', getQualityColor(stats.dataQualityScore))} />
                        </div>
                        <Progress value={stats.dataQualityScore} className="h-3" />
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProjects}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.featuredProjects} featured
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalSkills}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all categories
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Experiences</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalExperiences}</div>
                        <p className="text-xs text-muted-foreground">
                            Professional history
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recently Updated</CardTitle>
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.recentlyUpdated}</div>
                        <p className="text-xs text-muted-foreground">
                            In the last 30 days
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quality Report */}
            {qualityReport && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {qualityReport.isValid ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            )}
                            Quality Report
                        </CardTitle>
                        <CardDescription>
                            Last checked: {new Date().toLocaleString()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Stats */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Total Entities</p>
                                <p className="text-2xl font-bold">{qualityReport.stats.totalEntities}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Duplicates</p>
                                <p className={cn(
                                    'text-2xl font-bold',
                                    qualityReport.stats.duplicates > 0 ? 'text-orange-600' : 'text-green-600'
                                )}>
                                    {qualityReport.stats.duplicates}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Broken Refs</p>
                                <p className={cn(
                                    'text-2xl font-bold',
                                    qualityReport.stats.brokenReferences > 0 ? 'text-red-600' : 'text-green-600'
                                )}>
                                    {qualityReport.stats.brokenReferences}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Unused</p>
                                <p className={cn(
                                    'text-2xl font-bold',
                                    qualityReport.stats.unusedEntities > 0 ? 'text-yellow-600' : 'text-green-600'
                                )}>
                                    {qualityReport.stats.unusedEntities}
                                </p>
                            </div>
                        </div>

                        {/* Errors */}
                        {qualityReport.errors.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    Errors ({qualityReport.errors.length})
                                </h4>
                                <div className="space-y-2">
                                    {qualityReport.errors.map((error, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md"
                                        >
                                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium">{error.message}</p>
                                                <div className="flex gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {error.type}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        {error.entity}
                                                        {error.field && `.${error.field}`}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Warnings */}
                        {qualityReport.warnings.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    Warnings ({qualityReport.warnings.length})
                                </h4>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {qualityReport.warnings.map((warning, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md"
                                        >
                                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm">{warning.message}</p>
                                                <div className="flex gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {warning.type}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        {warning.entity}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Success message */}
                        {qualityReport.errors.length === 0 && qualityReport.warnings.length === 0 && (
                            <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                    All data quality checks passed! Your data is in excellent condition.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Optimization Actions</CardTitle>
                    <CardDescription>
                        Tools to maintain and improve data quality
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={runQualityCheck}
                        disabled={isRefreshing}
                    >
                        <Shield className="mr-2 h-4 w-4" />
                        Run Full Data Quality Scan
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={deduplicateAllData}
                        disabled={isRefreshing}
                    >
                        <Database className="mr-2 h-4 w-4" />
                        Find and Remove Duplicates
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        disabled
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Validate All References (Coming Soon)
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
