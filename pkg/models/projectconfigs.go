package models

type ProjectConfig struct {
	ProjectID string      `json:"projectId" yaml:"projectId"`
	Key       string      `json:"key" yaml:"key"`
	Value     interface{} `json:"value" yaml:"value"`
}

const (
	ServiceMetricsConfigKey = "service-metrics-config"
	ProjectMetricsConfigKey = "project-metrics-config"
	DeviceMetricsConfigKey  = "device-metrics-config"
)

type ServiceMetricsConfig struct {
	ApplicationID  string          `json:"applicationId" yaml:"applicationId"`
	Service        string          `json:"service" yaml:"service"`
	ExposedMetrics []ExposedMetric `json:"exposedMetrics" yaml:"exposedMetrics"`
}

type ProjectMetricsConfig struct {
	ExposedMetrics []ExposedMetric `json:"exposedMetrics" yaml:"exposedMetrics"`
}

type DeviceMetricsConfig struct {
	ExposedMetrics []ExposedMetric `json:"exposedMetrics" yaml:"exposedMetrics"`
}

type ExposedMetric struct {
	Metric     string   `json:"metric" yaml:"metric"`
	Labels     []string `json:"labels" yaml:"labels"`
	Properties []string `json:"properties" yaml:"properties"`
}
