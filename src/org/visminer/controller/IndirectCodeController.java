package org.visminer.controller;

import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.bson.Document;
import org.bson.conversions.Bson;
import org.repositoryminer.persistence.handler.IndirectCodeAnalysisDocumentHandler;

import com.mongodb.BasicDBObject;
import com.mongodb.client.model.Filters;

@Path("indirectcode")
public class IndirectCodeController {
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("get-metrics")
	public String getMetrics(@QueryParam("fileHash") final long fileHash, @QueryParam("commitHash") final String commitHash) {
		IndirectCodeAnalysisDocumentHandler indirectCodeAnalysisDocumentHandler = new IndirectCodeAnalysisDocumentHandler();
		Bson clause1 = new BasicDBObject("filehash", fileHash);
		
		List<Document> docs = indirectCodeAnalysisDocumentHandler.findMany(Filters.and(clause1));
		
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
