package org.visminer.controller;

import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.bson.Document;
import org.repositoryminer.technicaldebt.persistence.TechnicalCodeDebtDocumentHandler;

@Path("td-management")
public class TDManagementController {

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("find")
	public String find(@QueryParam("commit") final String commit, @QueryParam("types") final List<String> types,
			@QueryParam("indicators") final List<String> indicators, @QueryParam("is_td") final Boolean isTd) {
		TechnicalCodeDebtDocumentHandler handler = new TechnicalCodeDebtDocumentHandler();
		List<Document> docs = handler.findToManagement(commit, types, indicators, isTd);

		StringBuilder builder = new StringBuilder("{");
		for (Document d : docs) {
			builder.append(d.toJson()).append(",");
		}
		builder.append("}");

		return builder.toString();
	}

}