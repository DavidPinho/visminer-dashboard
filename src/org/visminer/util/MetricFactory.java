package org.visminer.util;

import java.util.HashMap;
import java.util.Map;

import org.repositoryminer.metric.MetricId;
import org.repositoryminer.metric.clazz.ATFD;
import org.repositoryminer.metric.clazz.CYCLO;
import org.repositoryminer.metric.clazz.IClassMetric;
import org.repositoryminer.metric.clazz.LOC;
import org.repositoryminer.metric.clazz.LVAR;
import org.repositoryminer.metric.clazz.MAXNESTING;
import org.repositoryminer.metric.clazz.MLOC;
import org.repositoryminer.metric.clazz.NOA;
import org.repositoryminer.metric.clazz.NOAV;
import org.repositoryminer.metric.clazz.NOM;
import org.repositoryminer.metric.clazz.PAR;
import org.repositoryminer.metric.clazz.TCC;
import org.repositoryminer.metric.clazz.WMC;

public class MetricFactory {

	private static Map<MetricId, IClassMetric> classMetrics = new HashMap<MetricId, IClassMetric>();
	
	static {
		classMetrics.put(MetricId.ATFD, new ATFD());
		classMetrics.put(MetricId.CYCLO, new CYCLO());
		classMetrics.put(MetricId.LOC, new LOC());
		classMetrics.put(MetricId.LVAR, new LVAR());
		classMetrics.put(MetricId.MAXNESTING, new MAXNESTING());
		classMetrics.put(MetricId.MLOC, new MLOC());
		classMetrics.put(MetricId.NOA, new NOA());
		classMetrics.put(MetricId.NOAV, new NOAV());
		classMetrics.put(MetricId.NOM, new NOM());
		classMetrics.put(MetricId.PAR, new PAR());
		classMetrics.put(MetricId.TCC, new TCC());
		classMetrics.put(MetricId.WMC, new WMC());
	}

	public static IClassMetric getMetric(String key) {
		return classMetrics.get(key);
	}
	
}