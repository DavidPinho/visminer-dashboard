package org.visminer.controller;

import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.bson.Document;
import org.repositoryminer.model.Reference;
import org.repositoryminer.persistence.handler.ReferenceDocumentHandler;
import org.repositoryminer.scm.ReferenceType;
import org.repositoryminer.technicaldebt.persistence.TechnicalCodeDebtDocumentHandler;

import com.mongodb.client.model.Projections;

@Path("td-management")
public class TDManagementController {

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("find")
	public String find(@QueryParam("repositoryId") final String repositoryId, @QueryParam("tag") final String tag, @QueryParam("types") final List<String> types,
			@QueryParam("indicators") final List<String> indicators, @QueryParam("is_td") final Boolean isTd) {
		ReferenceDocumentHandler refHandler = new ReferenceDocumentHandler();
		Reference r = Reference.parseDocument(refHandler.findByNameAndType(tag, ReferenceType.TAG, repositoryId, Projections.slice("commit", 1)));
		TechnicalCodeDebtDocumentHandler handler = new TechnicalCodeDebtDocumentHandler();
		List<Document> docs = handler.findToManagement(r.getCommits().get(0), types, indicators, isTd);
		System.out.println(docs);
		String json = "[";
		for (Document d : docs) {
			json += d.toJson()+",";
		}
		json = json.substring(0, json.length()-1) + "]";
		return json;
	}

}