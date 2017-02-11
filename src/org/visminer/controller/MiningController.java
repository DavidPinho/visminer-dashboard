package org.visminer.controller;

import java.io.IOException;
import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.repositoryminer.checkstyle.CheckstyleMiner;
import org.repositoryminer.codemetric.CodeMetricId;
import org.repositoryminer.exceptions.RepositoryMinerException;
import org.repositoryminer.findbugs.FindBugsMiner;
import org.repositoryminer.findbugs.configuration.Effort;
import org.repositoryminer.findbugs.configuration.Priority;
import org.repositoryminer.mining.RepositoryMiner;
import org.repositoryminer.model.Reference;
import org.repositoryminer.model.Repository;
import org.repositoryminer.parser.java.JavaParser;
import org.repositoryminer.persistence.handler.RepositoryDocumentHandler;
import org.repositoryminer.pmd.cpd.CPDMiner;
import org.repositoryminer.scm.ISCM;
import org.repositoryminer.scm.ReferenceType;
import org.repositoryminer.scm.SCMFactory;
import org.repositoryminer.scm.SCMType;
import org.repositoryminer.technicaldebt.TDAnalyzer;
import org.repositoryminer.codesmell.direct.BrainClass;
import org.repositoryminer.codesmell.direct.BrainMethod;
import org.repositoryminer.codesmell.direct.ComplexMethod;
import org.repositoryminer.codesmell.direct.DataClass;
import org.repositoryminer.codesmell.direct.GodClass;
import org.repositoryminer.codesmell.direct.LongMethod;
import org.visminer.request.MiningRequest;
import org.visminer.util.MetricFactory;

import com.mongodb.client.model.Projections;

import org.repositoryminer.codemetric.direct.AMW;
import org.repositoryminer.codemetric.direct.ATFD;
import org.repositoryminer.codemetric.direct.CYCLO;
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
import org.repositoryminer.codemetric.indirect.BOvR;
import org.repositoryminer.codemetric.indirect.BUR;
import org.repositoryminer.codemetric.indirect.DIT;
import org.repositoryminer.codesmell.indirect.DepthOfInheritanceTree;
import org.repositoryminer.codesmell.indirect.RefusedParentBequest;


@Path("mining")
public class MiningController {

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Path("get-references")
	public List<Reference> getReferences(@QueryParam("scm") String scmCode, @QueryParam("path") String path) {
		try {
			SCMType scmType = SCMType.valueOf(scmCode);
			ISCM scm = SCMFactory.getSCM(scmType);

			scm.open(path);
			List<Reference> references = scm.getReferences();
			scm.close();

			return references;
		} catch (NullPointerException |  RepositoryMinerException e) {
			throw new WebApplicationException(e.getMessage(), 400);
		}
	}

	@PUT
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.TEXT_PLAIN)
	@Path("mine")
	public String mine(MiningRequest request) {
		RepositoryMiner rm = new RepositoryMiner(request.getPath(), request.getName(), request.getDescription(), request.getScm());

		rm.addParser(new JavaParser());

		for (Reference ref : request.getReferences()) {
			System.out.println("ref.getName: " +ref.getName());
			System.out.println("ref.getType: " +ref.getType());
			rm.addReference(ref.getName(), ref.getType());
		}

//		for (CodeMetricId metric : request.getMetrics()) {
//			System.out.println("metric: " +metric.toString());
//			rm.addDirectCodeMetric(MetricFactory.getMetric(metric));
//		}
		
		rm.addDirectCodeMetric(new AMW());
		rm.addDirectCodeMetric(new ATFD());
		rm.addDirectCodeMetric(new CYCLO());
		rm.addDirectCodeMetric(new LOC());
		rm.addDirectCodeMetric(new LVAR());
		rm.addDirectCodeMetric(new MAXNESTING());
		rm.addDirectCodeMetric(new MLOC());
		rm.addDirectCodeMetric(new NOA());
		rm.addDirectCodeMetric(new NOAM());
		rm.addDirectCodeMetric(new NOAV());
		rm.addDirectCodeMetric(new NOM());
		rm.addDirectCodeMetric(new NOPA());
		rm.addDirectCodeMetric(new NProtM());
		rm.addDirectCodeMetric(new PAR());
		rm.addDirectCodeMetric(new TCC());
		rm.addDirectCodeMetric(new WMC());
		rm.addDirectCodeMetric(new WOC());

		rm.addIndirectCodeMetric(new BOvR());
		rm.addIndirectCodeMetric(new BUR());
		rm.addIndirectCodeMetric(new DIT());
		
		rm.addDirectCodeSmell(new BrainClass());
		rm.addDirectCodeSmell(new BrainMethod());
		rm.addDirectCodeSmell(new ComplexMethod());
		rm.addDirectCodeSmell(new DataClass());
		rm.addDirectCodeSmell(new GodClass());
		rm.addDirectCodeSmell(new LongMethod());
		
		rm.addIndirectCodeSmell(new DepthOfInheritanceTree());
		rm.addIndirectCodeSmell(new RefusedParentBequest());
		
		rm.addDirectCodeSmell(new BrainClass());
		rm.addDirectCodeSmell(new BrainMethod());
		rm.addDirectCodeSmell(new ComplexMethod());
		rm.addDirectCodeSmell(new DataClass());
		rm.addDirectCodeSmell(new GodClass());
		rm.addDirectCodeSmell(new LongMethod());
		
		try {
			return rm.mine().getId();
		} catch (IOException e) {
			throw new WebApplicationException(e.getMessage(), 400);
		}
	}
	
	@GET
	@Produces(MediaType.TEXT_PLAIN)
	@Path("td")
	public String td(@QueryParam("repositoryId") final String repositoryId, @QueryParam("tag") final String tag) {
		System.out.println("foi");
		RepositoryDocumentHandler handler = new RepositoryDocumentHandler();
        Repository repo = Repository.parseDocument(handler.findById(repositoryId, Projections.include("path")));
        
        FindBugsMiner findbugs = new FindBugsMiner(repo.getId());
        findbugs.addAnalysisClassPath(repo.getPath());
        findbugs.setEffort(Effort.MAX);
        findbugs.setBugPriority(Priority.NORMAL);
        
        try {
			findbugs.execute(tag, ReferenceType.TAG);
		} catch (IllegalStateException | IOException | InterruptedException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
        
        CheckstyleMiner checkstyle = new CheckstyleMiner(repo.getId());
        checkstyle.execute(tag, ReferenceType.TAG);
        
        CPDMiner cpd = new CPDMiner(repo.getId());
        try {
			cpd.execute(tag, ReferenceType.TAG);
		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
        
        TDAnalyzer td = new TDAnalyzer(repo.getId());
        td.execute(tag, ReferenceType.TAG);
		
		return "ok";
	}
}