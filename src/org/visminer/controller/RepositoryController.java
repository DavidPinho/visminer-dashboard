package org.visminer.controller;

import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;

import org.bson.Document;
import org.repositoryminer.model.Repository;
import org.repositoryminer.persistence.handler.ReferenceDocumentHandler;
import org.repositoryminer.persistence.handler.RepositoryDocumentHandler;

import com.mongodb.client.model.Projections;

@Path("repository")
public class RepositoryController {

	@GET
	@Path("get-repositories")
	public String getRepositories() {
		RepositoryDocumentHandler repoHandler = new RepositoryDocumentHandler();
		List<Document> docs = repoHandler.findAll();
		StringBuilder builder = new StringBuilder("[");
		for (Document d : docs) {
			builder.append(d.toJson());
		}
		builder.append("]");
		return builder.toString();
	}
	
	@GET
	@Path("get-references")
	public String getReferences(@QueryParam("repositoryId") final String repositoryId) {
		RepositoryDocumentHandler handler = new RepositoryDocumentHandler();
        Repository repo = Repository.parseDocument(handler.findById(repositoryId, Projections.include("path")));
		ReferenceDocumentHandler refHandler = new ReferenceDocumentHandler();
		List<Document> docs = refHandler.getByRepository(repo.getId());
		StringBuilder builder = new StringBuilder("[");
		for (Document d : docs) {
			builder.append(d.toJson());
		}
		builder.append("]");
		return builder.toString();
	}
}