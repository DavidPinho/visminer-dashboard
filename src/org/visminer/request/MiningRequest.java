package org.visminer.request;

import java.util.List;

import org.repositoryminer.codemetric.CodeMetricId;
import org.repositoryminer.model.Reference;
import org.repositoryminer.scm.SCMType;

public class MiningRequest {

	private String name;
	private String description;
	private String path;
	private SCMType scm;
	private List<Reference> references;
	private List<CodeMetricId> metrics;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public SCMType getScm() {
		return scm;
	}

	public void setScm(SCMType scm) {
		this.scm = scm;
	}

	public List<Reference> getReferences() {
		return references;
	}

	public void setReferences(List<Reference> references) {
		this.references = references;
	}

	public List<CodeMetricId> getMetrics() {
		return metrics;
	}

	public void setMetrics(List<CodeMetricId> metrics) {
		this.metrics = metrics;
	}

	@Override
	public String toString() {
		return "MiningRequest [name=" + name + ", description=" + description + ", path=" + path + ", scm=" + scm
				+ ", references=" + references.size() + ", metrics=" + metrics.size() + "]";
	}

}