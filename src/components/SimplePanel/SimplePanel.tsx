import React, { useMemo } from 'react';
import { DashboardCursorSync, DataFrameType, PanelProps } from '@grafana/data';
import { KeyboardPlugin, TimeSeries, TooltipDisplayMode, TooltipPlugin, TooltipPlugin2, ZoomPlugin, usePanelContext } from '@grafana/ui';
import { Options } from '../../types';
import { PanelDataErrorView, config } from '@grafana/runtime';
import { css } from '@emotion/css';
import { getTimezones, isTooltipScrollable, prepareGraphableFields } from './utils';
import { TimeSeriesTooltip } from './TimeSeriesTooltip';

interface Props extends PanelProps<Options> {}

export function SimplePanel({
  data,
  timeRange,
  timeZone,
  width,
  height,
  options,
  fieldConfig,
  id,
  onChangeTimeRange
}: Props) {

const { sync } =
  usePanelContext();
const showNewVizTooltips =
    config.featureToggles.newVizTooltips && (sync == null || sync() !== DashboardCursorSync.Tooltip);
const frames = useMemo(() => prepareGraphableFields(data.series, config.theme2, timeRange), [data.series, timeRange]);
const timezones = useMemo(() => getTimezones(options.timezone, timeZone), [options.timezone, timeZone]);
const suggestions = useMemo(() => {
  if (frames?.length && frames.every((df) => df.meta?.type === DataFrameType.TimeSeriesLong)) {
    return {
      message: 'Long data must be converted to wide',
      suggestions: undefined,
    };
  }
  return undefined;
}, [frames]);



//const labelFieldsValue = options.labelFields?.map((_) => data.series[0].fields.find((f) => f.name === _)) ?? [];


if (!frames || suggestions) {
  return (
    <PanelDataErrorView
      panelId={id}
      message={suggestions?.message}
      fieldConfig={fieldConfig}
      data={data}
      needsTimeField={true}
      needsNumberField={true}
      suggestions={suggestions?.suggestions}
    />
  );
}
  return (
    <TimeSeries
      frames={frames}
      structureRev={data.structureRev}
      timeRange={timeRange}
      timeZone={timezones}
      width={width}
      height={height}
      legend={options.legend}
      options={options}
    >
      {(uplotConfig, alignedDataFrame) => {
        return (
          <>
            {!showNewVizTooltips && <KeyboardPlugin config={uplotConfig} />}
            {options.tooltip.mode === TooltipDisplayMode.None || (
              <>
                {showNewVizTooltips ? (
                  <TooltipPlugin2
                    config={uplotConfig}
                    hoverMode={
                      options.tooltip.mode === TooltipDisplayMode.Single ? 1 : 0
                    }
                    queryZoom={onChangeTimeRange}
                    clientZoom={true}
                    render={(u, dataIdxs, seriesIdx, isPinned = false, dismiss, timeRange2, viaSync) => {
                      if (viaSync) {
                        return null;
                      }

                      return (
                        // not sure it header time here works for annotations, since it's taken from nearest datapoint index
                        <TimeSeriesTooltip
                          frames={frames}
                          seriesFrame={alignedDataFrame}
                          labelFields={options.labelFields}
                          dataIdxs={dataIdxs}
                          seriesIdx={seriesIdx}
                          mode={options.tooltip.mode}
                          sortOrder={options.tooltip.sort}
                          isPinned={isPinned}
                          scrollable={isTooltipScrollable(options.tooltip)}
                        />
                      );
                    }}
                    maxWidth={options.tooltip.maxWidth}
                    maxHeight={options.tooltip.maxHeight}
                  />
                ) : (
                  <>
                    <ZoomPlugin config={uplotConfig} onZoom={onChangeTimeRange} withZoomY={true} />
                    <TooltipPlugin
                      frames={frames}
                      data={alignedDataFrame}
                      config={uplotConfig}
                      mode={options.tooltip.mode}
                      sortOrder={options.tooltip.sort}
                      sync={sync}
                      timeZone={timeZone}
                    />
                  </>
                )}
              </>
            )}
            <ZoomPlugin config={uplotConfig} onZoom={onChangeTimeRange} />
          </>
        );
      }}
    </TimeSeries>
  );
}
export const getStyles = () => ({
  wrapper: css({
    display: 'flex',
    flexDirection: 'column',
  }),
});
