import {
  FieldColorModeId,
  FieldConfigProperty,
  FieldType,
  SetFieldConfigOptionsArgs,
  Field,
  PanelPlugin,
  identityOverrideProcessor,
} from '@grafana/data';
import {
  BarAlignment,
  GraphDrawStyle,
  GraphFieldConfig,
  GraphGradientMode,
  LineInterpolation,
  VisibilityMode,
  StackingMode,
  GraphTransform,
  LineStyle,
  GraphThresholdsStyleMode,
} from '@grafana/schema';
import { FieldConfig, Options } from './types';
import { SimplePanel } from './components';
import { graphFieldOptions, commonOptionsBuilder } from '@grafana/ui';
import { graphPanelChangedHandler } from 'components/SimplePanel/migrations';
import { TimezonesEditor } from 'components/SimplePanel/TimezonesEditor';
import { SpanNullsEditor } from 'components/SimplePanel/SpanNullsEditor';
import { InsertNullsEditor } from 'components/SimplePanel/InsertNullsEditor';
import { ThresholdsStyleEditor } from 'components/SimplePanel/ThresholdsStyleEditor';
import { LineStyleEditor } from 'components/SimplePanel/LineStyleEditor';
import { FieldSelectEditor } from 'grafana-plugin-support';
export const defaultGraphConfig: GraphFieldConfig = {
  drawStyle: GraphDrawStyle.Line,
  lineInterpolation: LineInterpolation.Linear,
  lineWidth: 1,
  fillOpacity: 0,
  gradientMode: GraphGradientMode.None,
  barAlignment: BarAlignment.Center,
  stacking: {
    mode: StackingMode.None,
    group: 'A',
  },
  axisGridShow: true,
  axisCenteredZero: false,
  axisBorderShow: false,
};

const categoryStyles = ['Graph styles'];

export type NullEditorSettings = { isTime: boolean };

export function getGraphFieldConfig(cfg: GraphFieldConfig, isTime = true): SetFieldConfigOptionsArgs<GraphFieldConfig> {
  return {
    standardOptions: {
      [FieldConfigProperty.Color]: {
        settings: {
          byValueSupport: true,
          bySeriesSupport: true,
          preferThresholdsMode: false,
        },
        defaultValue: {
          mode: FieldColorModeId.PaletteClassic,
        },
      },
    },
    useCustomConfig: (builder) => {
      builder
        .addRadio({
          path: 'drawStyle',
          name: 'Style',
          category: categoryStyles,
          defaultValue: cfg.drawStyle,
          settings: {
            options: graphFieldOptions.drawStyle,
          },
        })
        .addRadio({
          path: 'lineInterpolation',
          name: 'Line interpolation',
          category: categoryStyles,
          defaultValue: cfg.lineInterpolation,
          settings: {
            options: graphFieldOptions.lineInterpolation,
          },
          showIf: (config) => config.drawStyle === GraphDrawStyle.Line,
        })
        .addRadio({
          path: 'barAlignment',
          name: 'Bar alignment',
          category: categoryStyles,
          defaultValue: cfg.barAlignment,
          settings: {
            options: graphFieldOptions.barAlignment,
          },
          showIf: (config) => config.drawStyle === GraphDrawStyle.Bars,
        })
        .addSliderInput({
          path: 'lineWidth',
          name: 'Line width',
          category: categoryStyles,
          defaultValue: cfg.lineWidth,
          settings: {
            min: 0,
            max: 10,
            step: 1,
            ariaLabelForHandle: 'Line width',
          },
          showIf: (config) => config.drawStyle !== GraphDrawStyle.Points,
        })
        .addSliderInput({
          path: 'fillOpacity',
          name: 'Fill opacity',
          category: categoryStyles,
          defaultValue: cfg.fillOpacity,
          settings: {
            min: 0,
            max: 100,
            step: 1,
            ariaLabelForHandle: 'Fill opacity',
          },
          showIf: (config) => config.drawStyle !== GraphDrawStyle.Points,
        })
        .addRadio({
          path: 'gradientMode',
          name: 'Gradient mode',
          category: categoryStyles,
          defaultValue: graphFieldOptions.fillGradient[0].value,
          settings: {
            options: graphFieldOptions.fillGradient,
          },
          showIf: (config) => config.drawStyle !== GraphDrawStyle.Points,
        })
        .addFieldNamePicker({
          path: 'fillBelowTo',
          name: 'Fill below to',
          category: categoryStyles,
          hideFromDefaults: true,
          settings: {
            filter: (field: Field) => field.type === FieldType.number,
          },
        })
        .addCustomEditor<void, LineStyle>({
          id: 'lineStyle',
          path: 'lineStyle',
          name: 'Line style',
          category: categoryStyles,
          showIf: (config) => config.drawStyle === GraphDrawStyle.Line,
          editor: LineStyleEditor,
          override: LineStyleEditor,
          process: identityOverrideProcessor,
          shouldApply: (field) => field.type === FieldType.number,
        })
        .addCustomEditor<NullEditorSettings, boolean>({
          id: 'spanNulls',
          path: 'spanNulls',
          name: 'Connect null values',
          category: categoryStyles,
          defaultValue: false,
          editor: SpanNullsEditor,
          override: SpanNullsEditor,
          showIf: (config) => config.drawStyle === GraphDrawStyle.Line,
          shouldApply: (field) => field.type !== FieldType.time,
          process: identityOverrideProcessor,
          settings: { isTime },
        })
        .addCustomEditor<NullEditorSettings, boolean>({
          id: 'insertNulls',
          path: 'insertNulls',
          name: 'Disconnect values',
          category: categoryStyles,
          defaultValue: false,
          editor: InsertNullsEditor,
          override: InsertNullsEditor,
          showIf: (config) => config.drawStyle === GraphDrawStyle.Line,
          shouldApply: (field) => field.type !== FieldType.time,
          process: identityOverrideProcessor,
          settings: { isTime },
        })
        .addRadio({
          path: 'showPoints',
          name: 'Show points',
          category: categoryStyles,
          defaultValue: graphFieldOptions.showPoints[0].value,
          settings: {
            options: graphFieldOptions.showPoints,
          },
          showIf: (config) => config.drawStyle !== GraphDrawStyle.Points,
        })
        .addSliderInput({
          path: 'pointSize',
          name: 'Point size',
          category: categoryStyles,
          defaultValue: 5,
          settings: {
            min: 1,
            max: 40,
            step: 1,
            ariaLabelForHandle: 'Point size',
          },
          showIf: (config) => config.showPoints !== VisibilityMode.Never || config.drawStyle === GraphDrawStyle.Points,
        });

      commonOptionsBuilder.addStackingConfig(builder, cfg.stacking, categoryStyles);

      builder.addSelect({
        category: categoryStyles,
        name: 'Transform',
        path: 'transform',
        settings: {
          options: [
            {
              label: 'Constant',
              value: GraphTransform.Constant,
              description: 'The first value will be shown as a constant line',
            },
            {
              label: 'Negative Y',
              value: GraphTransform.NegativeY,
              description: 'Flip the results to negative values on the y axis',
            },
          ],
          isClearable: true,
        },
        hideFromDefaults: true,
      });

      commonOptionsBuilder.addAxisConfig(builder, cfg);
      commonOptionsBuilder.addHideFrom(builder);

      builder.addCustomEditor({
        id: 'thresholdsStyle',
        path: 'thresholdsStyle',
        name: 'Show thresholds',
        category: ['Thresholds'],
        defaultValue: { mode: GraphThresholdsStyleMode.Off },
        settings: {
          options: graphFieldOptions.thresholdsDisplayModes,
        },
        editor: ThresholdsStyleEditor,
        override: ThresholdsStyleEditor,
        process: identityOverrideProcessor,
        shouldApply: () => true,
      });
    },
  };
}

export const plugin = new PanelPlugin<Options, FieldConfig>(SimplePanel)
  .setPanelChangeHandler(graphPanelChangedHandler)
  .useFieldConfig(getGraphFieldConfig(defaultGraphConfig))
  .setPanelOptions((builder) => {
    commonOptionsBuilder.addTooltipOptions(builder, false, true)
    commonOptionsBuilder.addLegendOptions(builder);
    builder.addCustomEditor({
      id: 'timezone',
      name: 'Time zone',
      path: 'timezone',
      category: ['Axis'],
      editor: TimezonesEditor,
      defaultValue: undefined,
    });
    builder.addCustomEditor({
      id: 'labelFields',
      name: 'Labels',
      path: 'labelFields',
      category: ['Tooltip'],
      description: 'Fields to use as labels in the tooltip.',
      editor: FieldSelectEditor,
      settings: {
        multi: true,
      },
      defaultValue: undefined,
    });
  })
  .setDataSupport({ annotations: true, alertStates: true });


