package org.visminer.util;

import java.util.HashMap;
import java.util.Map;

import org.repositoryminer.codemetric.CodeMetricId;
import org.repositoryminer.codemetric.direct.AMW;
import org.repositoryminer.codemetric.direct.ATFD;
import org.repositoryminer.codemetric.direct.CYCLO;
import org.repositoryminer.codemetric.direct.IDirectCodeMetric;
import org.repositoryminer.codemetric.direct.LOC;
import org.repositoryminer.codemetric.direct.LVAR;
import org.repositoryminer.codemetric.direct.MAXNESTING;
import org.repositoryminer.codemetric.direct.MLOC;
import org.repositoryminer.codemetric.direct.NOA;
import org.repositoryminer.codemetric.direct.NOAM;
import org.repositoryminer.codemetric.direct.NOAV;
import org.repositoryminer.codemetric.direct.NOM;
import org.repositoryminer.codemetric.direct.NOPA;
import org.repositoryminer.codemetric.direct.NProtM;
import org.repositoryminer.codemetric.direct.PAR;
import org.repositoryminer.codemetric.direct.TCC;
import org.repositoryminer.codemetric.direct.WMC;
import org.repositoryminer.codemetric.direct.WOC;

public class MetricFactory {

	private static Map<CodeMetricId, IDirectCodeMetric> classMetrics = new HashMap<CodeMetricId, IDirectCodeMetric>();
	
	static {
		classMetrics.put(CodeMetricId.AMW, new AMW());
		classMetrics.put(CodeMetricId.ATFD, new ATFD());
		classMetrics.put(CodeMetricId.CYCLO, new CYCLO());
		classMetrics.put(CodeMetricId.LOC, new LOC());
		classMetrics.put(CodeMetricId.LVAR, new LVAR());
		classMetrics.put(CodeMetricId.MAXNESTING, new MAXNESTING());
		classMetrics.put(CodeMetricId.MLOC, new MLOC());
		classMetrics.put(CodeMetricId.NOA, new NOA());
		classMetrics.put(CodeMetricId.NOAM, new NOAM());
		classMetrics.put(CodeMetricId.NOAV, new NOAV());
		classMetrics.put(CodeMetricId.NOM, new NOM());
		classMetrics.put(CodeMetricId.NOPA, new NOPA());
		classMetrics.put(CodeMetricId.NProtM, new NProtM());
		classMetrics.put(CodeMetricId.PAR, new PAR());
		classMetrics.put(CodeMetricId.TCC, new TCC());
		classMetrics.put(CodeMetricId.WMC, new WMC());
		classMetrics.put(CodeMetricId.WOC, new WOC());
	}

	public static IDirectCodeMetric getMetric(CodeMetricId key) {
		return classMetrics.get(key);
	}
	
}