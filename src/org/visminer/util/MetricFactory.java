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

	private static Map<String, IClassMetric> classMetrics = new HashMap<String, IClassMetric>();
	
	static {
		classMetrics.put(MetricId.ATFD.toString(), new ATFD());
		classMetrics.put(MetricId.CYCLO.toString(), new CYCLO());
		classMetrics.put(MetricId.LOC.toString(), new LOC());
		classMetrics.put(MetricId.LVAR.toString(), new LVAR());
		classMetrics.put(MetricId.MAXNESTING.toString(), new MAXNESTING());
		classMetrics.put(MetricId.MLOC.toString(), new MLOC());
		classMetrics.put(MetricId.NOA.toString(), new NOA());
		classMetrics.put(MetricId.NOAV.toString(), new NOAV());
		classMetrics.put(MetricId.NOM.toString(), new NOM());
		classMetrics.put(MetricId.PAR.toString(), new PAR());
		classMetrics.put(MetricId.TCC.toString(), new TCC());
		classMetrics.put(MetricId.WMC.toString(), new WMC());
	}

	public static IClassMetric getMetric(String key) {
		return classMetrics.get(key);
	}
	
}