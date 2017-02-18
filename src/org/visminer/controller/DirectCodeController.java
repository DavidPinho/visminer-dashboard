package org.visminer.controller;

import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.bson.Document;
import org.bson.conversions.Bson;
import org.repositoryminer.persistence.handler.DirectCodeAnalysisDocumentHandler;

import com.mongodb.BasicDBObject;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Projections;

@Path("directcode")
public class DirectCodeController {
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("get-metrics")
	public String getMetrics(@QueryParam("fileHash") final long fileHash, @QueryParam("commit") final String commit) {
		DirectCodeAnalysisDocumentHandler directCodeAnalysisDocumentHandler = new DirectCodeAnalysisDocumentHandler();
		
		Bson clause1 = new BasicDBObject("filehash", fileHash);
		Bson clause2 = new BasicDBObject("commit", commit);
		List<Document> docs = directCodeAnalysisDocumentHandler.findMany(Filters.and(clause1, clause2), Projections.include("classes.metrics"));
		
		String json = "[";
		for (Document d : docs) {
			json += d.toJson()+",";
		}
		if (json.length() > 1) {
			json = json.substring(0, json.length()-1);
		}
		json += "]";
		return json;
	}

}