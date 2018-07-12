/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  InfraDatabaseSearchResponse,
  InfraESQuery,
  InfraNodeRequestOptions,
} from '../../../infra_types';
import { createQuery } from './create_query';

interface CardinalityOfFieldParams {
  size: number;
  query: InfraESQuery;
  aggs: {
    nodeCount: { cardinality: { field: string } };
  };
}

interface CardinalityAggregation {
  nodeCount: { value: number };
}

export async function calculateCardinalityOfNodeField(
  search: <Aggregation>(options: object) => Promise<InfraDatabaseSearchResponse<{}, Aggregation>>,
  nodeField: string,
  options: InfraNodeRequestOptions
): Promise<number> {
  const { indexPattern }: InfraNodeRequestOptions = options;
  const body: CardinalityOfFieldParams = {
    aggs: {
      nodeCount: {
        cardinality: { field: nodeField },
      },
    },
    query: createQuery(options),
    size: 0,
  };

  const resp = await search<CardinalityAggregation>({
    body,
    index: indexPattern.pattern,
  });

  if (resp.aggregations) {
    return resp.aggregations.nodeCount.value;
  }

  return 0;
}
