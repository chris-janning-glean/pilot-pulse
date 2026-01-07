import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Configure API connections and dashboard preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary-600" />
              <CardTitle>API Configuration</CardTitle>
            </div>
            <CardDescription>
              Configure your Glean API and other service connections
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">
                Environment Variables
              </h3>
              <div className="rounded-md bg-gray-50 p-4 font-mono text-sm">
                <p className="text-gray-700">
                  NEXT_PUBLIC_GLEAN_API_ENDPOINT=https://your-instance-be.glean.com
                </p>
                <p className="text-gray-700 mt-1">
                  NEXT_PUBLIC_GLEAN_API_KEY=your_api_key_here
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">
                Configuration File
              </h3>
              <p className="text-sm text-gray-600">
                You can also configure API endpoints programmatically in{' '}
                <code className="bg-gray-100 px-1 py-0.5 rounded">
                  src/lib/config.ts
                </code>
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Adding New Dashboards
              </h3>
              <p className="text-sm text-gray-600">
                To add a new dashboard, update the{' '}
                <code className="bg-gray-100 px-1 py-0.5 rounded">
                  DASHBOARD_CONFIGS
                </code>{' '}
                array in{' '}
                <code className="bg-gray-100 px-1 py-0.5 rounded">
                  src/lib/config.ts
                </code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

