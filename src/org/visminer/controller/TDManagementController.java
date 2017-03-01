package org.visminer.controller;

import java.util.ArrayList;
import java.util.List;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import org.bson.Document;
import org.bson.types.ObjectId;
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
			@QueryParam("indicators") final List<String> indicators, @QueryParam("is_td") final Boolean isTd, @QueryParam("is_checked") final Boolean isChecked) {
		ReferenceDocumentHandler refHandler = new ReferenceDocumentHandler();
		Reference r = Reference.parseDocument(refHandler.findByNameAndType(tag, ReferenceType.TAG, repositoryId, Projections.slice("commit", 1)));
		TechnicalCodeDebtDocumentHandler handler = new TechnicalCodeDebtDocumentHandler();
		List<Document> docs = handler.findToManagement(r.getCommits().get(0), types, indicators, isTd, isChecked);
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
	
	@PUT
	@Produces(MediaType.APPLICATION_JSON)
	@Path("save")
	public String save(@QueryParam("id") final String id, @QueryParam("contributors") final String contributorsString, @QueryParam("isChecked") final Boolean isChecked,  
			@QueryParam("isTD") final Boolean isTD, @QueryParam("principal") final Integer principal, @QueryParam("estimates") final String estimates, 
			@QueryParam("notes") final String notes, @QueryParam("interest_amount") final Integer interest_amount, 
			@QueryParam("interest_probability") final Integer interest_probability, @QueryParam("intentional") final Boolean intentional) {
		
		TechnicalCodeDebtDocumentHandler handler = new TechnicalCodeDebtDocumentHandler();
		String[] contributors = contributorsString.split(";");
		List<Document> contributorsDocs = new ArrayList<Document>(contributors.length);
		Document details = new Document();
		
		if (isTD) {
			details.put("principal", principal);
			details.put("estimates", estimates);
			details.put("notes", notes);
			details.put("interest_amount", interest_amount);
			details.put("interest_probability", interest_probability);
			details.put("intentional", intentional);
		}
		
		for (int i = 0; i < contributors.length; i++) {
			String[] contributorInfo = contributors[i].split("&");
			Document contributor = new Document();
			contributor.append("name", contributorInfo[0]);
			contributor.append("email", contributorInfo[1]);
			contributor.append("colaborator", contributorInfo[2]);
			contributorsDocs.add(contributor);
		}
		
		Document clause = new Document("_id", new ObjectId(id));
		Document newDoc = new Document("$set", new Document("details", details).append("contributors", contributorsDocs).append("checked", isChecked).append("technical_debt", isTD));
		handler.updateOne(clause, newDoc);
		
		return handler.findById(id).toJson();
	}
}
