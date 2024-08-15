
import * as common from '@grafana/schema';

export interface Options extends common.OptionsWithTimezones {
  legend: common.VizLegendOptions;
  tooltip: common.VizTooltipOptions;
  labelFields: string[];
}

export interface FieldConfig extends common.GraphFieldConfig {}
